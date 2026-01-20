import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyExpense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  sector: 'publico' | 'privado';
  project_id?: string;
  project_name?: string;
  notes?: string;
  created_at: string;
}

export interface ExpenseSummary {
  totalPublico: number;
  totalPrivado: number;
  totalGeral: number;
  countPublico: number;
  countPrivado: number;
  byCategory: { category: string; total: number; count: number }[];
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

    // Agrupar por categoria
    const categoryMap: { [key: string]: { total: number; count: number } } = {};
    expenses.forEach(e => {
      const cat = e.category || 'Outros';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0 };
      }
      categoryMap[cat].total += Number(e.amount);
      categoryMap[cat].count += 1;
    });

    const byCategory = Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
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
      countPublico: publicExpenses.length,
      countPrivado: privateExpenses.length,
      byCategory,
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

  return {
    expenses,
    publicExpenses,
    privateExpenses,
    summary,
    loading,
    error,
    refetch: fetchExpenses
  };
}
