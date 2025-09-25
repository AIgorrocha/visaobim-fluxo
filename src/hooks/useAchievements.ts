import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types';

interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  requirement: {
    type: 'tasks_completed' | 'points_earned' | 'level_reached' | 'projects_completed';
    target: number;
  };
}

const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    id: 'first_task',
    title: 'Primeira Tarefa',
    description: 'Complete sua primeira tarefa',
    icon: '🎯',
    points: 5,
    requirement: { type: 'tasks_completed', target: 1 }
  },
  {
    id: 'task_starter',
    title: 'Iniciante das Tarefas',
    description: 'Complete 3 tarefas',
    icon: '⚡',
    points: 10,
    requirement: { type: 'tasks_completed', target: 3 }
  },
  {
    id: 'task_achiever',
    title: 'Realizador',
    description: 'Complete 5 tarefas',
    icon: '🌟',
    points: 15,
    requirement: { type: 'tasks_completed', target: 5 }
  },
  {
    id: 'task_master',
    title: 'Mestre das Tarefas',
    description: 'Complete 10 tarefas',
    icon: '🏆',
    points: 25,
    requirement: { type: 'tasks_completed', target: 10 }
  },
  {
    id: 'task_legend',
    title: 'Lenda das Tarefas',
    description: 'Complete 20 tarefas',
    icon: '👑',
    points: 40,
    requirement: { type: 'tasks_completed', target: 20 }
  },
  {
    id: 'level_rookie',
    title: 'Novato',
    description: 'Alcance o nível 2',
    icon: '🌱',
    points: 8,
    requirement: { type: 'level_reached', target: 2 }
  },
  {
    id: 'level_apprentice',
    title: 'Aprendiz',
    description: 'Alcance o nível 3',
    icon: '📚',
    points: 12,
    requirement: { type: 'level_reached', target: 3 }
  },
  {
    id: 'level_professional',
    title: 'Profissional',
    description: 'Alcance o nível 5',
    icon: '💼',
    points: 20,
    requirement: { type: 'level_reached', target: 5 }
  },
  {
    id: 'level_expert',
    title: 'Especialista',
    description: 'Alcance o nível 8',
    icon: '🎖️',
    points: 30,
    requirement: { type: 'level_reached', target: 8 }
  },
  {
    id: 'level_master',
    title: 'Mestre',
    description: 'Alcance o nível 10',
    icon: '💎',
    points: 50,
    requirement: { type: 'level_reached', target: 10 }
  },
  {
    id: 'points_beginner',
    title: 'Colecionador Iniciante',
    description: 'Acumule 20 pontos',
    icon: '⭐',
    points: 8,
    requirement: { type: 'points_earned', target: 20 }
  },
  {
    id: 'points_collector',
    title: 'Colecionador de Pontos',
    description: 'Acumule 40 pontos',
    icon: '🌟',
    points: 15,
    requirement: { type: 'points_earned', target: 40 }
  },
  {
    id: 'points_master',
    title: 'Mestre dos Pontos',
    description: 'Acumule 100 pontos',
    icon: '💫',
    points: 25,
    requirement: { type: 'points_earned', target: 100 }
  },
  {
    id: 'project_starter',
    title: 'Iniciador de Projetos',
    description: 'Participe de 2 projetos',
    icon: '🚀',
    points: 15,
    requirement: { type: 'projects_completed', target: 2 }
  },
  {
    id: 'project_collaborator',
    title: 'Colaborador Ativo',
    description: 'Participe de 5 projetos',
    icon: '🤝',
    points: 25,
    requirement: { type: 'projects_completed', target: 5 }
  }
];

export const useAchievements = () => {
  const { user, profile } = useAuth();
  const { tasks, projects, achievements, createAchievement } = useSupabaseData();
  const [processing, setProcessing] = useState(false);

  const checkAndAwardAchievements = async () => {
    if (!user || !profile || processing) return;

    setProcessing(true);

    try {
      // Calcular estatísticas do usuário
      const userTasks = tasks.filter((t: any) => 
        Array.isArray(t.assigned_to) 
          ? t.assigned_to.includes(user.id) 
          : t.assigned_to === user.id
      );
      
      const completedTasks = userTasks.filter((t: any) => t.status === 'CONCLUIDA');
      const userProjects = projects.filter((p: any) => p.responsible_ids?.includes(user.id));
      const userAchievements = achievements.filter((a: any) => a.user_id === user.id);

      const stats = {
        tasks_completed: completedTasks.length,
        points_earned: profile.points || 0,
        level_reached: profile.level || 1,
        projects_completed: userProjects.length
      };

      // Verificar cada template de achievement
      for (const template of ACHIEVEMENT_TEMPLATES) {
        const hasAchievement = userAchievements.some((ua: any) => ua.title === template.title);
        
        if (!hasAchievement) {
          const meetsRequirement = stats[template.requirement.type] >= template.requirement.target;
          
          if (meetsRequirement) {
            try {
              await createAchievement({
                user_id: user.id,
                achievement_type: template.id,
                title: template.title,
                description: template.description,
                icon: template.icon,
                points_earned: template.points
              });

              // Atualizar pontos do usuário
              const newPoints = (profile.points || 0) + template.points;
              const newLevel = Math.floor(newPoints / 20) + 1;
              
              await supabase
                .from('profiles')
                .update({ 
                  points: newPoints,
                  level: newLevel
                })
                .eq('id', user.id);

              console.log(`🏆 Nova conquista desbloqueada: ${template.title}!`);
            } catch (error) {
              console.error('Erro ao criar achievement:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar achievements:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Verificar achievements quando dados relevantes mudarem
  useEffect(() => {
    checkAndAwardAchievements();
  }, [tasks, profile?.points, profile?.level]);

  return {
    checkAndAwardAchievements,
    processing
  };
};