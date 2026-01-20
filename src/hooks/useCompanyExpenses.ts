import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyExpense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  cost_center: string;
  contract_name: string;
  sector: 'publico' | 'privado';
  project_id?: string;
  project_name?: string;
  responsible?: string;
  created_at: string;
}

export interface ExpenseSummary {
  totalPublico: number;
  totalPrivado: number;
  totalGeral: number;
  totalGeral_empresa: number; // Despesas sem projeto (GERAL)
  totalGeral_contratos: number; // Despesas vinculadas a contratos
  countPublico: number;
  countPrivado: number;
  byCostCenter: { cost_center: string; total: number; count: number }[];
  byContract: { contract_name: string; project_id: string | null; total: number; count: number }[];
  byMonth: { month: string; publico: number; privado: number }[];
}

/**
 * Hook para buscar e gerenciar despesas da empresa
 */
export function useCompanyExpenses() {
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('company_expenses') as any)
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((e: any) => ({
        ...e,
        project_name: e.projects?.name || null
      }));

      setExpenses(formattedData);
    } catch (err: any) {
      console.error('Erro ao buscar despesas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Calcular resumo
  const summary = useMemo<ExpenseSummary>(() => {
    const publicExpenses = expenses.filter(e => e.sector === 'publico');
    const privateExpenses = expenses.filter(e => e.sector === 'privado');

    const totalPublico = publicExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalPrivado = privateExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Despesas da empresa (GERAL) vs vinculadas a contratos
    const empresaExpenses = expenses.filter(e => e.contract_name === 'GERAL' || !e.project_id);
    const contratoExpenses = expenses.filter(e => e.contract_name !== 'GERAL' && e.project_id);

    const totalGeral_empresa = empresaExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalGeral_contratos = contratoExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Agrupar por centro de custo
    const costCenterMap: { [key: string]: { total: number; count: number } } = {};
    expenses.forEach(e => {
      const cc = e.cost_center || 'Outros';
      if (!costCenterMap[cc]) {
        costCenterMap[cc] = { total: 0, count: 0 };
      }
      costCenterMap[cc].total += Number(e.amount);
      costCenterMap[cc].count += 1;
    });

    const byCostCenter = Object.entries(costCenterMap)
      .map(([cost_center, data]) => ({ cost_center, ...data }))
      .sort((a, b) => b.total - a.total);

    // Agrupar por contrato
    const contractMap: { [key: string]: { project_id: string | null; total: number; count: number } } = {};
    expenses.forEach(e => {
      const contract = e.contract_name || 'GERAL';
      if (!contractMap[contract]) {
        contractMap[contract] = { project_id: e.project_id || null, total: 0, count: 0 };
      }
      contractMap[contract].total += Number(e.amount);
      contractMap[contract].count += 1;
    });

    const byContract = Object.entries(contractMap)
      .map(([contract_name, data]) => ({ contract_name, ...data }))
      .sort((a, b) => b.total - a.total);

    // Agrupar por mês
    const monthMap: { [key: string]: { publico: number; privado: number } } = {};
    expenses.forEach(e => {
      const month = e.expense_date?.substring(0, 7) || 'Sem data';
      if (!monthMap[month]) {
        monthMap[month] = { publico: 0, privado: 0 };
      }
      if (e.sector === 'publico') {
        monthMap[month].publico += Number(e.amount);
      } else {
        monthMap[month].privado += Number(e.amount);
      }
    });

    const byMonth = Object.entries(monthMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return {
      totalPublico,
      totalPrivado,
      totalGeral: totalPublico + totalPrivado,
      totalGeral_empresa,
      totalGeral_contratos,
      countPublico: publicExpenses.length,
      countPrivado: privateExpenses.length,
      byCostCenter,
      byContract,
      byMonth
    };
  }, [expenses]);

  // Filtrar por setor
  const publicExpenses = useMemo(() =>
    expenses.filter(e => e.sector === 'publico'),
    [expenses]
  );

  const privateExpenses = useMemo(() =>
    expenses.filter(e => e.sector === 'privado'),
    [expenses]
  );

  // Obter despesas por projeto
  const getExpensesByProject = useCallback((projectId: string) => {
    return expenses.filter(e => e.project_id === projectId);
  }, [expenses]);

  // Obter total de despesas por projeto
  const getTotalExpensesByProject = useCallback((projectId: string) => {
    return expenses
      .filter(e => e.project_id === projectId)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  return {
    expenses,
    publicExpenses,
    privateExpenses,
    summary,
    loading,
    error,
    refetch: fetchExpenses,
    getExpensesByProject,
    getTotalExpensesByProject
  };
}
