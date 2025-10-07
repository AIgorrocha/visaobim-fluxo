import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export interface TaskRestriction {
  id: string;
  waiting_task_id: string;
  blocking_task_id: string;
  blocking_user_id: string;
  status: 'active' | 'resolved' | 'cancelled';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  blocking_task_title?: string;
  blocking_user_name?: string;
}

export const useTaskRestrictions = () => {
  const [restrictions, setRestrictions] = useState<TaskRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRestrictions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_restrictions')
        .select(`
          *,
          waiting_task:tasks!waiting_task_id(title, status, assigned_to),
          blocking_task:tasks!blocking_task_id(title, status, assigned_to),
          blocking_user:profiles!blocking_user_id(full_name, email)
        `)
        .eq('status', 'active');

      if (error) throw error;

      const formattedRestrictions: TaskRestriction[] = data?.map(item => ({
        id: item.id,
        waiting_task_id: item.waiting_task_id,
        blocking_task_id: item.blocking_task_id,
        blocking_user_id: item.blocking_user_id,
        status: item.status as 'active' | 'resolved' | 'cancelled',
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolved_at: item.resolved_at,
        blocking_task_title: item.blocking_task?.title || 'Unknown Task',
        blocking_user_name: item.blocking_user?.full_name || 'Unknown User'
      })) || [];

      setRestrictions(formattedRestrictions);
    } catch (err) {
      console.error('Erro ao carregar restrições:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setRestrictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar tarefas que ESTA tarefa está ESPERANDO (esta tarefa é a waiting_task)
  const fetchWaitingRestrictions = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_restrictions')
        .select(`
          *,
          blocking_task:tasks!blocking_task_id(title, status, assigned_to),
          blocking_user:profiles!blocking_user_id(full_name, email)
        `)
        .eq('waiting_task_id', taskId)
        .eq('status', 'active');

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        waiting_task_id: item.waiting_task_id,
        blocking_task_id: item.blocking_task_id,
        blocking_user_id: item.blocking_user_id,
        status: item.status as 'active' | 'resolved' | 'cancelled',
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolved_at: item.resolved_at,
        blocking_task_title: item.blocking_task?.title || 'Unknown Task',
        blocking_user_name: item.blocking_user?.full_name || 'Unknown User'
      })) || [];
    } catch (err) {
      console.error('Erro ao carregar restrições de espera:', err);
      return [];
    }
  };

  // Buscar tarefas que ESTA tarefa está BLOQUEANDO (esta tarefa é a blocking_task)
  const fetchBlockingRestrictions = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_restrictions')
        .select(`
          *,
          waiting_task:tasks!waiting_task_id(title, status, assigned_to),
          blocking_user:profiles!blocking_user_id(full_name, email)
        `)
        .eq('blocking_task_id', taskId)
        .eq('status', 'active');

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        waiting_task_id: item.waiting_task_id,
        blocking_task_id: item.blocking_task_id,
        blocking_user_id: item.blocking_user_id,
        status: item.status as 'active' | 'resolved' | 'cancelled',
        created_at: item.created_at,
        updated_at: item.updated_at,
        resolved_at: item.resolved_at,
        waiting_task_title: item.waiting_task?.title || 'Unknown Task',
        blocking_user_name: item.blocking_user?.full_name || 'Unknown User'
      })) || [];
    } catch (err) {
      console.error('Erro ao carregar restrições de bloqueio:', err);
      return [];
    }
  };

  const createRestriction = async (restrictionData: {
    waiting_task_id: string;
    blocking_task_id: string;
    blocking_user_id: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('task_restrictions')
        .insert([{
          ...restrictionData,
          status: 'active'
        }])
        .select();

      if (error) throw error;

      // Recarregar restrições
      await fetchRestrictions();

      return { success: true, data };
    } catch (err) {
      console.error('Erro ao criar restrição:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  const deleteRestriction = async (restrictionId: string) => {
    try {
      const { error } = await supabase
        .from('task_restrictions')
        .delete()
        .eq('id', restrictionId);

      if (error) throw error;

      // Recarregar restrições
      await fetchRestrictions();

      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar restrição:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  const updateRestriction = async (restrictionId: string, updates: Partial<TaskRestriction>) => {
    try {
      const { data, error } = await supabase
        .from('task_restrictions')
        .update(updates)
        .eq('id', restrictionId)
        .select();

      if (error) throw error;

      // Recarregar restrições
      await fetchRestrictions();

      return { success: true, data };
    } catch (err) {
      console.error('Erro ao atualizar restrição:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  useEffect(() => {
    if (user) {
      fetchRestrictions();
    }
  }, [user]);

  return {
    restrictions,
    loading,
    error,
    refetch: fetchRestrictions,
    createRestriction,
    deleteRestriction,
    updateRestriction,
    fetchWaitingRestrictions,
    fetchBlockingRestrictions
  };
};