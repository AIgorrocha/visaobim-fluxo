import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

export interface ContractIncome {
  id: string;
  project_id: string;
  amount: number;
  income_date: string;
  description?: string;
  income_type: 'medicao' | 'entrada' | 'parcela' | 'outro';
  created_at: string;
}

export interface ContractOverview {
  project_id: string;
  project_name: string;
  client: string;
  type: 'privado' | 'publico';
  status: string;
  contract_value: number;
  total_received: number;
  amount_to_receive: number;
  total_paid_designers: number;
  amount_to_pay_designers: number;
  profit_margin: number;
  contract_end?: string;
}

export interface ContractSummary {
  totalContractValue: number;
  totalReceived: number;
  totalToReceive: number;
  totalPaidDesigners: number;
  totalToPayDesigners: number;
  estimatedMargin: number;
  contractsInProgress: number;
  contractsCompleted: number;
}

/**
 * Hook para buscar receitas de contratos (medições, parcelas, etc.)
 */
export function useContractIncome() {
  const [income, setIncome] = useState<ContractIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contract_income')
        .select('*')
        .order('income_date', { ascending: false });

      if (error) throw error;
      setIncome(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar receitas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  return {
    income,
    loading,
    error,
    refetch: fetchIncome
  };
}

/**
 * Hook para visão geral dos contratos
 * Combina dados de projetos, receitas e pagamentos a projetistas
 */
export function useContractOverview() {
  const { projects, payments, pricing } = useSupabaseData();
  const { income, loading: incomeLoading } = useContractIncome();

  // Calcular visão geral de cada contrato
  const contractsOverview = useMemo<ContractOverview[]>(() => {
    if (!projects || projects.length === 0) return [];

    return projects
      .filter(p => !p.is_archived && p.project_value && p.project_value > 0)
      .map(project => {
        // Total recebido do cliente (soma das receitas do contrato)
        const projectIncome = income.filter(i => i.project_id === project.id);
        const totalReceived = projectIncome.reduce((sum, i) => sum + Number(i.amount), 0);

        // Total pago aos projetistas (soma dos pagamentos com status 'pago')
        const projectPayments = payments.filter(
          p => p.project_id === project.id && p.status === 'pago'
        );
        const totalPaidDesigners = projectPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        // Total a pagar aos projetistas (soma dos valores de designer_value das precificações)
        const projectPricing = pricing.filter(p => p.project_id === project.id);
        const totalDesignerValue = projectPricing.reduce(
          (sum, p) => sum + Number(p.designer_value || 0),
          0
        );
        const amountToPayDesigners = Math.max(0, totalDesignerValue - totalPaidDesigners);

        // Valor do contrato e a receber
        const contractValue = Number(project.project_value) || 0;
        const amountToReceive = Math.max(0, contractValue - totalReceived);

        // Margem estimada (recebido - pago aos projetistas)
        const profitMargin = totalReceived - totalPaidDesigners;

        return {
          project_id: project.id,
          project_name: project.name,
          client: project.client,
          type: project.type,
          status: project.status,
          contract_value: contractValue,
          total_received: totalReceived,
          amount_to_receive: amountToReceive,
          total_paid_designers: totalPaidDesigners,
          amount_to_pay_designers: amountToPayDesigners,
          profit_margin: profitMargin,
          contract_end: project.contract_end
        };
      })
      .sort((a, b) => b.contract_value - a.contract_value); // Ordenar por valor
  }, [projects, income, payments, pricing]);

  // Calcular resumo geral
  const summary = useMemo<ContractSummary>(() => {
    const activeContracts = contractsOverview.filter(
      c => c.status === 'EM_ANDAMENTO' || c.status === 'AGUARDANDO_APROVACAO' || c.status === 'AGUARDANDO_PAGAMENTO'
    );

    const totalContractValue = contractsOverview.reduce((sum, c) => sum + c.contract_value, 0);
    const totalReceived = contractsOverview.reduce((sum, c) => sum + c.total_received, 0);
    const totalToReceive = contractsOverview.reduce((sum, c) => sum + c.amount_to_receive, 0);
    const totalPaidDesigners = contractsOverview.reduce((sum, c) => sum + c.total_paid_designers, 0);
    const totalToPayDesigners = contractsOverview.reduce((sum, c) => sum + c.amount_to_pay_designers, 0);

    return {
      totalContractValue,
      totalReceived,
      totalToReceive,
      totalPaidDesigners,
      totalToPayDesigners,
      estimatedMargin: totalReceived - totalPaidDesigners,
      contractsInProgress: activeContracts.length,
      contractsCompleted: contractsOverview.filter(c => c.status === 'CONCLUIDO').length
    };
  }, [contractsOverview]);

  // Separar por tipo
  const publicContracts = useMemo(() =>
    contractsOverview.filter(c => c.type === 'publico'),
    [contractsOverview]
  );

  const privateContracts = useMemo(() =>
    contractsOverview.filter(c => c.type === 'privado'),
    [contractsOverview]
  );

  return {
    contracts: contractsOverview,
    publicContracts,
    privateContracts,
    summary,
    loading: incomeLoading
  };
}
