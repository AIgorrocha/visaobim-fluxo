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

export interface CompanyExpenseData {
  id: string;
  project_id: string | null;
  amount: number;
  expense_date: string;
  description: string;
  cost_center: string;
  contract_name: string;
  sector: string;
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
  total_expenses: number; // Despesas do contrato
  profit_margin: number;
  contract_end?: string;
}

export interface ContractSummary {
  totalContractValue: number;
  totalReceived: number;
  totalToReceive: number;
  totalPaidDesigners: number;
  totalToPayDesigners: number;
  totalExpenses: number;
  totalExpenses_empresa: number; // Despesas GERAL
  totalExpenses_contratos: number; // Despesas vinculadas
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
      const { data, error } = await (supabase
        .from('contract_income') as any)
        .select('*')
        .order('income_date', { ascending: false });

      if (error) throw error;
      setIncome((data || []) as ContractIncome[]);
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
 * Hook para buscar despesas da empresa
 */
export function useCompanyExpensesData() {
  const [expenses, setExpenses] = useState<CompanyExpenseData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('company_expenses') as any)
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return { expenses, loading, refetch: fetchExpenses };
}

/**
 * Hook para visão geral dos contratos
 * Combina dados de projetos, receitas, pagamentos a projetistas e despesas
 */
export function useContractOverview() {
  const { projects, payments, pricing } = useSupabaseData();
  const { income, loading: incomeLoading } = useContractIncome();
  const { expenses, loading: expensesLoading } = useCompanyExpensesData();

  // Calcular visão geral de cada contrato
  const contractsOverview = useMemo<ContractOverview[]>(() => {
    if (!projects || projects.length === 0) return [];

    return projects
      // Excluir arquivados, sem valor e EM_ESPERA (ainda não iniciaram)
      .filter(p => !p.is_archived && p.project_value && p.project_value > 0 && p.status !== 'EM_ESPERA')
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

        // Total de despesas do contrato
        const projectExpenses = expenses.filter(e => e.project_id === project.id);
        const totalExpenses = projectExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

        // Valor do contrato e a receber
        const contractValue = Number(project.project_value) || 0;
        const amountToReceive = Math.max(0, contractValue - totalReceived);

        // Margem estimada (recebido - pago aos projetistas - despesas do contrato)
        const profitMargin = totalReceived - totalPaidDesigners - totalExpenses;

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
          total_expenses: totalExpenses,
          profit_margin: profitMargin,
          contract_end: project.contract_end
        };
      })
      .sort((a, b) => b.contract_value - a.contract_value); // Ordenar por valor
  }, [projects, income, payments, pricing, expenses]);

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

    // Despesas vinculadas a contratos
    const totalExpenses_contratos = contractsOverview.reduce((sum, c) => sum + c.total_expenses, 0);

    // Despesas da empresa (GERAL - sem projeto vinculado)
    const empresaExpenses = expenses.filter(e => !e.project_id || e.contract_name === 'GERAL');
    const totalExpenses_empresa = empresaExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const totalExpenses = totalExpenses_contratos + totalExpenses_empresa;

    return {
      totalContractValue,
      totalReceived,
      totalToReceive,
      totalPaidDesigners,
      totalToPayDesigners,
      totalExpenses,
      totalExpenses_empresa,
      totalExpenses_contratos,
      estimatedMargin: totalReceived - totalPaidDesigners - totalExpenses_contratos,
      contractsInProgress: activeContracts.length,
      contractsCompleted: contractsOverview.filter(c => c.status === 'CONCLUIDO').length
    };
  }, [contractsOverview, expenses]);

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
    expenses,
    loading: incomeLoading || expensesLoading
  };
}

/**
 * Interface para detalhes completos de um contrato
 */
export interface ContractDetailData {
  contract: ContractOverview | null;
  payments: {
    id: string;
    designer_name: string;
    discipline: string;
    amount: number;
    payment_date: string;
    status: string;
    description?: string;
  }[];
  expenses: {
    id: string;
    description: string;
    amount: number;
    expense_date: string;
    cost_center: string;
  }[];
  income: {
    id: string;
    amount: number;
    income_date: string;
    description?: string;
    income_type: string;
  }[];
  pricing: {
    id: string;
    discipline_name: string;
    designer_name?: string;
    total_value: number;
    designer_value: number;
    amount_paid: number;
    status: string;
  }[];
  summary: {
    totalPaid: number;
    totalPending: number;
    totalExpenses: number;
    totalReceived: number;
    totalToReceive: number;
    saldo: number;
  };
}

/**
 * Hook para buscar detalhes completos de um contrato específico
 */
export function useContractDetails(projectId: string | null) {
  const [data, setData] = useState<ContractDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do projeto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      // Buscar pagamentos aos projetistas
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('designer_payments')
        .select(`
          id, discipline, amount, payment_date, status, description,
          profiles:designer_id (full_name)
        `)
        .eq('project_id', id)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Buscar despesas do contrato
      const { data: expensesData, error: expensesError } = await (supabase
        .from('company_expenses') as any)
        .select('id, description, amount, expense_date, cost_center')
        .eq('project_id', id)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      // Buscar receitas (income) do contrato
      const { data: incomeData, error: incomeError } = await (supabase
        .from('contract_income') as any)
        .select('id, amount, income_date, description, income_type')
        .eq('project_id', id)
        .order('income_date', { ascending: false });

      if (incomeError) throw incomeError;

      // Buscar precificações do contrato
      const { data: pricingData, error: pricingError } = await supabase
        .from('project_pricing')
        .select(`
          id, discipline_name, total_value, designer_value, amount_paid, status,
          profiles:designer_id (full_name)
        `)
        .eq('project_id', id)
        .order('discipline_name');

      if (pricingError) throw pricingError;

      // Formatar pagamentos
      const payments = (paymentsData || []).map((p: any) => ({
        id: p.id,
        designer_name: p.profiles?.full_name || 'N/A',
        discipline: p.discipline,
        amount: Number(p.amount),
        payment_date: p.payment_date,
        status: p.status,
        description: p.description
      }));

      // Formatar despesas
      const expenses = (expensesData || []).map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        expense_date: e.expense_date,
        cost_center: e.cost_center
      }));

      // Formatar receitas
      const income = (incomeData || []).map((i: any) => ({
        id: i.id,
        amount: Number(i.amount),
        income_date: i.income_date,
        description: i.description,
        income_type: i.income_type
      }));

      // Formatar precificações
      const pricing = (pricingData || []).map((p: any) => ({
        id: p.id,
        discipline_name: p.discipline_name,
        designer_name: p.profiles?.full_name,
        total_value: Number(p.total_value),
        designer_value: Number(p.designer_value),
        amount_paid: Number(p.amount_paid),
        status: p.status
      }));

      // Calcular resumo
      const totalPaid = payments.filter(p => p.status === 'pago').reduce((s, p) => s + p.amount, 0);
      const totalPending = payments.filter(p => p.status === 'pendente').reduce((s, p) => s + p.amount, 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const totalReceived = income.reduce((s, i) => s + i.amount, 0);
      const contractValue = Number(projectData.project_value) || 0;
      const totalToReceive = Math.max(0, contractValue - totalReceived);
      const saldo = totalReceived - totalPaid - totalExpenses;

      // Criar objeto de contrato
      const contract: ContractOverview = {
        project_id: projectData.id,
        project_name: projectData.name,
        client: projectData.client,
        type: projectData.type as 'privado' | 'publico',
        status: projectData.status,
        contract_value: contractValue,
        total_received: totalReceived,
        amount_to_receive: totalToReceive,
        total_paid_designers: totalPaid,
        amount_to_pay_designers: pricing.reduce((s, p) => s + Math.max(0, p.designer_value - p.amount_paid), 0),
        total_expenses: totalExpenses,
        profit_margin: saldo,
        contract_end: projectData.contract_end
      };

      setData({
        contract,
        payments,
        expenses,
        income,
        pricing,
        summary: {
          totalPaid,
          totalPending,
          totalExpenses,
          totalReceived,
          totalToReceive,
          saldo
        }
      });
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do contrato:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDetails(projectId);
    } else {
      setData(null);
    }
  }, [projectId]);

  return {
    data,
    loading,
    error,
    refetch: () => projectId && fetchDetails(projectId)
  };
}
