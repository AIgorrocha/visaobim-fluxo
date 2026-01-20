import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Discipline,
  ProjectPricing,
  DesignerPayment,
  DesignerFinancialSummary,
  DesignerReceivable,
  FinancialDashboardStats
} from '@/types';
import { findMatchingPayments } from '@/utils/financialMatching';

// ========================================
// HOOK PARA DISCIPLINAS
// ========================================
export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('disciplines') as any)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDisciplines((data || []) as Discipline[]);
    } catch (err: any) {
      console.error('Erro ao buscar disciplinas:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDiscipline = async (name: string, description?: string) => {
    try {
      const { data, error } = await (supabase
        .from('disciplines') as any)
        .insert([{ name: name.toUpperCase(), description, is_active: true }])
        .select()
        .single();

      if (error) throw error;
      setDisciplines(prev => [...prev, data as Discipline]);
      return data;
    } catch (err: any) {
      console.error('Erro ao criar disciplina:', err.message);
      throw err;
    }
  };

  const updateDiscipline = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name.toUpperCase();
      if (updates.description !== undefined) updateData.description = updates.description;

      const { data, error } = await (supabase
        .from('disciplines') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setDisciplines(prev => prev.map(d => d.id === id ? data as Discipline : d));
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar disciplina:', err.message);
      throw err;
    }
  };

  const deleteDiscipline = async (id: string) => {
    try {
      // Soft delete - apenas marca como inativo
      const { error } = await (supabase
        .from('disciplines') as any)
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      setDisciplines(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      console.error('Erro ao deletar disciplina:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  return {
    disciplines,
    loading,
    error,
    refetch: fetchDisciplines,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline
  };
}

// ========================================
// HOOK PARA PRECIFICAÇÃO DE PROJETOS
// ========================================
export function useProjectPricing(projectId?: string) {
  const [pricing, setPricing] = useState<ProjectPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      let query = (supabase
        .from('project_pricing') as any)
        .select(`
          *,
          profiles:designer_id (full_name),
          projects:project_id (name)
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear dados com nomes
      const mappedData = (data || []).map((item: any) => ({
        ...item,
        designer_name: item.profiles?.full_name,
        project_name: item.projects?.name
      })) as ProjectPricing[];

      setPricing(mappedData);
    } catch (err: any) {
      console.error('Erro ao buscar precificação:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createPricing = async (data: Omit<ProjectPricing, 'id' | 'created_at' | 'updated_at' | 'designer_value'>) => {
    try {
      const { data: newPricing, error } = await (supabase
        .from('project_pricing') as any)
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setPricing(prev => [newPricing as ProjectPricing, ...prev]);
      return newPricing;
    } catch (err: any) {
      console.error('Erro ao criar precificação:', err.message);
      throw err;
    }
  };

  const updatePricing = async (id: string, updates: Partial<ProjectPricing>) => {
    try {
      // Remover campos calculados e virtuais
      const { designer_value, designer_name, project_name, ...updateData } = updates as any;

      const { data, error } = await (supabase
        .from('project_pricing') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPricing(prev => prev.map(p => p.id === id ? data as ProjectPricing : p));
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar precificação:', err.message);
      throw err;
    }
  };

  const deletePricing = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('project_pricing') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPricing(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Erro ao deletar precificação:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  return {
    pricing,
    loading,
    error,
    createPricing,
    updatePricing,
    deletePricing,
    refetch: fetchPricing
  };
}

// ========================================
// HOOK PARA PAGAMENTOS DE PROJETISTAS
// ========================================
export function useDesignerPayments(designerId?: string) {
  const [payments, setPayments] = useState<DesignerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      let query = (supabase
        .from('designer_payments') as any)
        .select(`
          *,
          profiles:designer_id (full_name)
        `)
        .order('payment_date', { ascending: false });

      if (designerId) {
        query = query.eq('designer_id', designerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear dados com nomes
      const mappedData = (data || []).map((item: any) => ({
        ...item,
        designer_name: item.profiles?.full_name
      })) as DesignerPayment[];

      setPayments(mappedData);
    } catch (err: any) {
      console.error('Erro ao buscar pagamentos:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [designerId]);

  const createPayment = async (data: Omit<DesignerPayment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newPayment, error } = await (supabase
        .from('designer_payments') as any)
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setPayments(prev => [newPayment as DesignerPayment, ...prev]);
      return newPayment;
    } catch (err: any) {
      console.error('Erro ao criar pagamento:', err.message);
      throw err;
    }
  };

  const updatePayment = async (id: string, updates: Partial<DesignerPayment>) => {
    try {
      // Remover campos virtuais
      const { designer_name, ...updateData } = updates as any;

      const { data, error } = await (supabase
        .from('designer_payments') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPayments(prev => prev.map(p => p.id === id ? data as DesignerPayment : p));
      return data;
    } catch (err: any) {
      console.error('Erro ao atualizar pagamento:', err.message);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('designer_payments') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Erro ao deletar pagamento:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
    refetch: fetchPayments
  };
}

// ========================================
// HOOK PARA RESUMO FINANCEIRO DO PROJETISTA
// ========================================
export function useDesignerFinancialSummary(designerId: string) {
  const [summary, setSummary] = useState<FinancialDashboardStats | null>(null);
  const [receivables, setReceivables] = useState<DesignerReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!designerId) return;

    try {
      setLoading(true);

      // Buscar pagamentos do projetista
      const { data: payments, error: paymentsError } = await (supabase
        .from('designer_payments') as any)
        .select('*')
        .eq('designer_id', designerId)
        .neq('status', 'cancelado')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Buscar valores a receber (precificações)
      const { data: pricingData, error: pricingError } = await (supabase
        .from('project_pricing') as any)
        .select(`
          *,
          projects:project_id (name)
        `)
        .eq('designer_id', designerId);

      if (pricingError) throw pricingError;

      // Calcular estatísticas
      const totalReceived = payments?.reduce((sum, p) =>
        p.status === 'pago' ? sum + Number(p.amount) : sum, 0
      ) || 0;

      // Montar valores a receber usando matching por similaridade
      // Isso permite vincular pagamentos mesmo quando os nomes são diferentes
      // Ex: "DRF-PV" + "ESTRUTURAL" deve casar com "AGENCIA DA RECEITA FEDERAL" + "SUPERESTRUTURAS"
      const receivablesList: DesignerReceivable[] = (pricingData || [])
        .map((p: any) => {
          const projectName = p.projects?.name || '';

          // Usar função de matching por similaridade
          const amountPaidFromPayments = findMatchingPayments(
            payments || [],
            {
              designer_id: p.designer_id,
              project_name: projectName,
              discipline_name: p.discipline_name
            }
          );

          const designerValue = Number(p.designer_value || 0);
          const amountPending = Math.max(0, designerValue - amountPaidFromPayments);

          return {
            designer_id: p.designer_id,
            designer_name: '',
            project_id: p.project_id,
            project_name: projectName,
            discipline_name: p.discipline_name,
            total_value: Number(p.total_value),
            designer_percentage: Number(p.designer_percentage),
            designer_value: designerValue,
            amount_paid: amountPaidFromPayments,
            amount_pending: amountPending,
            status: amountPending === 0 ? 'pago' : amountPaidFromPayments > 0 ? 'parcial' : 'pendente'
          };
        })
        .filter((p: DesignerReceivable) => p.amount_pending > 0); // Só mostrar se ainda tem a receber

      // Calcular total pendente baseado nos receivables calculados
      const totalPending = receivablesList.reduce((sum, p) => sum + p.amount_pending, 0);

      // Agrupar por mês
      const paymentsByMonth: { [key: string]: number } = {};
      payments?.forEach(p => {
        if (p.status === 'pago') {
          const month = p.payment_date.substring(0, 7); // YYYY-MM
          paymentsByMonth[month] = (paymentsByMonth[month] || 0) + Number(p.amount);
        }
      });

      // Agrupar por projeto
      const paymentsByProject: { [key: string]: number } = {};
      payments?.forEach(p => {
        if (p.status === 'pago') {
          const name = p.project_name || 'Sem projeto';
          paymentsByProject[name] = (paymentsByProject[name] || 0) + Number(p.amount);
        }
      });

      // Agrupar por disciplina
      const paymentsByDiscipline: { [key: string]: number } = {};
      payments?.forEach(p => {
        if (p.status === 'pago') {
          paymentsByDiscipline[p.discipline] = (paymentsByDiscipline[p.discipline] || 0) + Number(p.amount);
        }
      });

      // Projetos únicos
      const uniqueProjects = new Set(payments?.map(p => p.project_id).filter(Boolean));

      const summaryData: FinancialDashboardStats = {
        totalReceived,
        totalPending,
        totalPayments: payments?.filter(p => p.status === 'pago').length || 0,
        projectsCount: uniqueProjects.size,
        lastPaymentDate: payments?.find(p => p.status === 'pago')?.payment_date,
        paymentsByMonth: Object.entries(paymentsByMonth)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month)),
        paymentsByProject: Object.entries(paymentsByProject)
          .map(([project_name, amount]) => ({ project_name, amount }))
          .sort((a, b) => b.amount - a.amount),
        paymentsByDiscipline: Object.entries(paymentsByDiscipline)
          .map(([discipline, amount]) => ({ discipline, amount }))
          .sort((a, b) => b.amount - a.amount)
      };

      setSummary(summaryData);
      setReceivables(receivablesList);
    } catch (err: any) {
      console.error('Erro ao buscar resumo financeiro:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [designerId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, receivables, loading, error, refetch: fetchSummary };
}

// ========================================
// HOOK PARA VISÃO GERAL DO ADMIN
// ========================================
export function useAdminFinancialOverview() {
  const [allPayments, setAllPayments] = useState<DesignerPayment[]>([]);
  const [allPricing, setAllPricing] = useState<ProjectPricing[]>([]);
  const [summaryByDesigner, setSummaryByDesigner] = useState<DesignerFinancialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);

      // Buscar todos os pagamentos
      const { data: payments, error: paymentsError } = await (supabase
        .from('designer_payments') as any)
        .select(`
          *,
          profiles:designer_id (full_name, email)
        `)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Buscar todas as precificações
      const { data: pricing, error: pricingError } = await (supabase
        .from('project_pricing') as any)
        .select(`
          *,
          profiles:designer_id (full_name),
          projects:project_id (name)
        `)
        .order('created_at', { ascending: false });

      if (pricingError) throw pricingError;

      // Mapear dados
      const mappedPayments = (payments || []).map((item: any) => ({
        ...item,
        designer_name: item.profiles?.full_name
      })) as DesignerPayment[];

      const mappedPricing = (pricing || []).map((item: any) => ({
        ...item,
        designer_name: item.profiles?.full_name,
        project_name: item.projects?.name
      })) as ProjectPricing[];

      // Calcular resumo por projetista
      const designerMap: { [id: string]: DesignerFinancialSummary } = {};

      payments?.forEach((p: any) => {
        const id = p.designer_id;
        if (!designerMap[id]) {
          designerMap[id] = {
            designer_id: id,
            designer_name: p.profiles?.full_name || 'Desconhecido',
            designer_email: p.profiles?.email || '',
            total_payments: 0,
            total_received: 0,
            total_pending: 0,
            projects_count: 0,
            last_payment_date: undefined
          };
        }

        if (p.status === 'pago') {
          designerMap[id].total_payments++;
          designerMap[id].total_received += Number(p.amount);
          if (!designerMap[id].last_payment_date || p.payment_date > designerMap[id].last_payment_date!) {
            designerMap[id].last_payment_date = p.payment_date;
          }
        }
      });

      // Adicionar valores a receber usando matching por similaridade
      pricing?.forEach((p: any) => {
        const id = p.designer_id;
        if (id && designerMap[id]) {
          const projectName = p.projects?.name || '';

          // Usar função de matching por similaridade
          const amountPaid = findMatchingPayments(
            payments || [],
            {
              designer_id: id,
              project_name: projectName,
              discipline_name: p.discipline_name
            }
          );

          const designerValue = Number(p.designer_value || 0);
          const pending = Math.max(0, designerValue - amountPaid);
          designerMap[id].total_pending += pending;
        }
      });

      // Contar projetos únicos
      const projectsByDesigner: { [id: string]: Set<string> } = {};
      payments?.forEach((p: any) => {
        if (p.project_id && p.designer_id) {
          if (!projectsByDesigner[p.designer_id]) {
            projectsByDesigner[p.designer_id] = new Set();
          }
          projectsByDesigner[p.designer_id].add(p.project_id);
        }
      });

      Object.keys(projectsByDesigner).forEach(id => {
        if (designerMap[id]) {
          designerMap[id].projects_count = projectsByDesigner[id].size;
        }
      });

      setAllPayments(mappedPayments);
      setAllPricing(mappedPricing);
      setSummaryByDesigner(Object.values(designerMap).sort((a, b) => b.total_received - a.total_received));
    } catch (err: any) {
      console.error('Erro ao buscar visão geral:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return {
    allPayments,
    allPricing,
    summaryByDesigner,
    loading,
    error,
    refetch: fetchOverview
  };
}
