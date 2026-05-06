import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Project, Task, Proposal } from '@/types';

// Hook para gerenciar perfis de usuários
export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      console.log('🔍 Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('is_active', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        throw error;
      }
      
      console.log('✅ Profiles fetched:', data?.length || 0, 'items');
      setProfiles((data || []) as Profile[]);
    } catch (err: any) {
      console.error('❌ Profiles fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      
      setProfiles(prev => [data as Profile, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === id ? data as Profile : p));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, error, createProfile, updateProfile, refetch: fetchProfiles };
}

// Hook para gerenciar projetos
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      console.log('🔍 Fetching projects...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching projects:', error);
        throw error;
      }
      
      console.log('✅ Projects fetched:', data?.length || 0, 'items');
      setProjects((data || []) as Project[]);
    } catch (err: any) {
      console.error('❌ Projects fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...project, is_archived: false }])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data as Project, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local apenas se o projeto já estiver na lista
      // Isso permite atualizar projetos arquivados quando estão sendo visualizados
      setProjects(prev => {
        const existsInList = prev.some(p => p.id === id);
        if (existsInList) {
          return prev.map(p => p.id === id ? data as Project : p);
        }
        return prev;
      });
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Soft delete - marcar como arquivado
      const { error } = await supabase
        .from('projects')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, createProject, updateProject, deleteProject, refetch: fetchProjects };
}

// Hook para gerenciar projetos arquivados (separado para evitar conflitos de estado)
export function useArchivedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      console.log('🔍 Fetching archived projects...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_archived', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching archived projects:', error);
        throw error;
      }
      
      console.log('✅ Archived projects fetched:', data?.length || 0, 'items');
      setProjects((data || []) as Project[]);
    } catch (err: any) {
      console.error('❌ Archived projects fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(p => p.id === id ? data as Project : p));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const unarchiveProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_archived: false })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, updateProject, unarchiveProject, refetch: fetchProjects };
}

// Hook para gerenciar tarefas
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      console.log('🔍 Fetching tasks...');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching tasks:', error);
        throw error;
      }
      
      console.log('✅ Tasks fetched:', data?.length || 0, 'items');
      setTasks((data || []) as Task[]);
    } catch (err: any) {
      console.error('❌ Tasks fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    try {
      // Garantir que assigned_to seja sempre um array para o Supabase
      const taskData = {
        ...task,
        assigned_to: Array.isArray(task.assigned_to) ? task.assigned_to : [task.assigned_to],
        is_archived: false
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data as Task, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Usar apenas campos essenciais da tabela tasks para evitar triggers
      const allowedFields = [
        'project_id', 'title', 'description', 'assigned_to', 'status',
        'phase', 'activity_start', 'due_date', 'last_delivery',
        'comment', 'dependencies', 'completed_at', 'is_archived'
      ];

      const updateData: any = {};

      // Incluir apenas campos permitidos
      allowedFields.forEach(field => {
        if (updates[field as keyof Task] !== undefined) {
          updateData[field] = updates[field as keyof Task];
        }
      });

      // Garantir que assigned_to seja array
      if (updateData.assigned_to) {
        updateData.assigned_to = Array.isArray(updateData.assigned_to)
          ? updateData.assigned_to
          : [updateData.assigned_to];
      }

      // CORRIGIDO: Agora salva no Supabase
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Error message:', error.message);
        throw error;
      }

      // Buscar a tarefa atualizada separadamente
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        // Se o fetch falhar, usar os dados locais
        const localTask = tasks.find(t => t.id === id);
        if (localTask) {
          const updatedTask = { ...localTask, ...updateData };
          setTasks(prev => prev.map(t => t.id === id ? updatedTask as Task : t));
          return updatedTask;
        }
        throw fetchError;
      }


      // Atualizar o estado local com os dados do Supabase
      setTasks(prev => prev.map(t => t.id === id ? data as Task : t));

      return data;
    } catch (err: any) {
      console.error('❌ Update task failed with error:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Soft delete - marcar como arquivado
      const { error } = await supabase
        .from('tasks')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getTasksByUser = (userId: string) => {
    return tasks.filter(task => 
      Array.isArray(task.assigned_to) 
        ? task.assigned_to.includes(userId)
        : task.assigned_to === userId
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, error, createTask, updateTask, deleteTask, getTasksByUser, refetch: fetchTasks };
}

// Hook para gerenciar propostas
export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      console.log('🔍 Fetching proposals...');
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching proposals:', error);
        throw error;
      }
      
      console.log('✅ Proposals fetched:', data?.length || 0, 'items');
      setProposals((data || []) as Proposal[]);
    } catch (err: any) {
      console.error('❌ Proposals fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{ ...proposal, is_archived: false }])
        .select()
        .single();

      if (error) throw error;
      
      setProposals(prev => [data as Proposal, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProposals(prev => prev.map(p => p.id === id ? data as Proposal : p));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      // Soft delete - marcar como arquivado
      const { error } = await supabase
        .from('proposals')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      setProposals(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return { proposals, loading, error, createProposal, updateProposal, deleteProposal, refetch: fetchProposals };
}

