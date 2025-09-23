import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { calculateUserPoints, getUserLevel } from '@/utils/scoring';

/**
 * Hook personalizado para obter dados e estatísticas do usuário
 * Centraliza a lógica de filtragem de projetos e tarefas do usuário
 */
export const useUserData = (userId?: string) => {
  const { user, profile } = useAuth();
  const { projects, tasks, profiles } = useSupabaseData();

  const targetUserId = userId || user?.id || '';
  const targetUser = userId ? profiles.find(p => p.id === userId) : profile;
  const isAdmin = profile?.role === 'admin';

  // Função para obter projetos do usuário
  const getUserProjects = (id: string) => {
    return projects.filter(project => 
      project.responsible_ids && project.responsible_ids.includes(id)
    );
  };

  // Função para obter tarefas do usuário
  const getUserTasks = (id: string) => {
    return tasks.filter(task => {
      if (Array.isArray(task.assigned_to)) {
        return task.assigned_to.includes(id);
      }
      return task.assigned_to === id;
    });
  };

  // Obter dados do usuário alvo
  const userProjects = getUserProjects(targetUserId);
  const userTasks = getUserTasks(targetUserId);
  
  // Estatísticas de projetos
  const activeProjects = userProjects.filter(p => p.status === 'EM_ANDAMENTO').length;
  const completedProjects = userProjects.filter(p => 
    p.status === 'CONCLUIDO' || p.status === 'FINALIZADO'
  ).length;

  // Estatísticas de tarefas
  const pendingTasks = userTasks.filter(t => t.status === 'PENDENTE');
  const completedTasks = userTasks.filter(t => t.status === 'CONCLUIDA');
  const inProgressTasks = userTasks.filter(t => t.status === 'EM_ANDAMENTO');
  
  // Calcular pontuação real baseada em tarefas concluídas
  const userPoints = calculateUserPoints(completedTasks);
  const userLevel = getUserLevel(userPoints);

  // Obter co-responsáveis de uma tarefa (excluindo o usuário alvo)
  const getCoResponsibles = (task: any) => {
    if (!Array.isArray(task.assigned_to)) return [];
    
    return task.assigned_to
      .filter(id => id !== targetUserId)
      .map(id => profiles.find(p => p.id === id))
      .filter(Boolean)
      .map(p => p?.full_name || p?.email)
      .join(', ');
  };

  // Obter nomes dos responsáveis por IDs
  const getResponsibleNames = (responsibleIds: string[]) => {
    if (!responsibleIds || responsibleIds.length === 0) return 'Não atribuído';
    
    return responsibleIds
      .map(id => {
        const profile = profiles.find(p => p.id === id);
        return profile?.full_name || profile?.email || 'Usuário não encontrado';
      })
      .join(', ');
  };

  return {
    // Dados do usuário
    user: targetUser,
    userId: targetUserId,
    isAdmin,
    
    // Projetos e tarefas
    userProjects,
    userTasks,
    
    // Estatísticas de projetos
    totalProjects: userProjects.length,
    activeProjects,
    completedProjects,
    
    // Estatísticas de tarefas
    totalTasks: userTasks.length,
    pendingTasks,
    completedTasks,
    inProgressTasks,
    
    // Pontuação e nível
    userPoints,
    userLevel,
    
    // Funções utilitárias
    getUserProjects,
    getUserTasks,
    getCoResponsibles,
    getResponsibleNames,
  };
};