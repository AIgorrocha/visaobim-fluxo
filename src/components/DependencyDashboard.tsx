import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Calendar,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { supabase } from '@/integrations/supabase/client';
import { TaskRestriction } from '@/types';

interface ActivityStats {
  availableTasks: any[];
  blockedTasks: any[];
  teamImpact: number;
}

export const DependencyDashboard = () => {
  const { user } = useAuth();
  const { tasks, profiles, projects } = useSupabaseData();
  const [restrictions, setRestrictions] = useState<TaskRestriction[]>([]);
  const [showAllAvailable, setShowAllAvailable] = useState(false);
  const [showAllBlocked, setShowAllBlocked] = useState(false);

  useEffect(() => {
    if (user) {
      loadRestrictions();

      // Setup realtime listener para mudanças nas restrições
      const channel = supabase
        .channel('task_restrictions_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'task_restrictions' },
          (payload) => {
            console.log('🔄 Restrição alterada:', payload);
            setTimeout(() => loadRestrictions(), 500);
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            console.log('🔄 Tarefa alterada:', payload);
            setTimeout(() => loadRestrictions(), 500);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Recarregar restrições quando tasks mudarem
  useEffect(() => {
    if (user && tasks.length > 0) {
      loadRestrictions();
    }
  }, [tasks]);

  const loadRestrictions = async () => {
    try {
      console.log('🔍 Carregando restrições para o painel...');

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

      console.log('📋 Restrições carregadas:', data?.length || 0);
      console.log('📋 Dados das restrições:', data);

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

      console.log('✅ Restrições atualizadas no estado:', formattedRestrictions.length);
    } catch (error) {
      console.error('❌ Erro ao carregar restrições:', error);
    }
  };

  if (!user) return null;

  // Função para calcular dias até o prazo
  const getDaysUntilDeadline = (dueDate: string) => {
    if (!dueDate) return 999;
    return Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  // Calcular estatísticas de atividades
  const calculateActivityStats = (): ActivityStats => {
    console.log('🧮 Calculando estatísticas de atividades...');
    console.log('👤 Usuário:', user.id);
    console.log('📋 Total de tarefas:', tasks.length);
    console.log('🔒 Total de restrições:', restrictions.length);

    const userTasks = tasks.filter(task =>
      Array.isArray(task.assigned_to)
        ? task.assigned_to.includes(user.id)
        : task.assigned_to === user.id
    );

    console.log('👤 Tarefas do usuário:', userTasks.length);

    // 1. Tarefas disponíveis (sem dependências bloqueadas) - ordenadas por prazo
    const availableTasks = userTasks
      .filter(task => {
        if (task.status !== 'PENDENTE') return false;

        // Verificar se a tarefa tem restrições ativas
        const hasActiveRestrictions = restrictions.some(r =>
          r.waiting_task_id === task.id && r.status === 'active'
        );

        console.log(`📋 Tarefa ${task.title} - Status: ${task.status}, Tem restrições: ${hasActiveRestrictions}`);

        return !hasActiveRestrictions;
      })
      .sort((a, b) => {
        // Tarefas sem prazo ficam no início
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return -1;
        if (!b.due_date) return 1;

        // Ordenar por prazo (mais próximo primeiro)
        const aDays = getDaysUntilDeadline(a.due_date);
        const bDays = getDaysUntilDeadline(b.due_date);
        return aDays - bDays;
      });

    console.log('✅ Tarefas disponíveis calculadas:', availableTasks.length);

    // 2. Tarefas bloqueadas (que estão aguardando)
    const blockedTasks = userTasks
      .filter(task => {
        if (task.status !== 'PENDENTE') return false;

        // Verificar se a tarefa tem restrições ativas
        return restrictions.some(r =>
          r.waiting_task_id === task.id && r.status === 'active'
        );
      })
      .sort((a, b) => {
        // Tarefas sem prazo ficam no início
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return -1;
        if (!b.due_date) return 1;

        // Ordenar por prazo (mais próximo primeiro)
        const aDays = getDaysUntilDeadline(a.due_date);
        const bDays = getDaysUntilDeadline(b.due_date);
        return aDays - bDays;
      });

    // 3. Impacto na equipe (número de tarefas que serão liberadas quando o usuário completar suas tarefas)
    const teamImpact = restrictions.filter(r =>
      r.blocking_user_id === user.id && r.status === 'active'
    ).length;

    return {
      availableTasks,
      blockedTasks,
      teamImpact
    };
  };

  const stats = calculateActivityStats();

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.name} - ${project.client}` : 'Projeto';
  };

  const formatDeadline = (dueDate: string) => {
    if (!dueDate) return 'Sem prazo';
    const days = getDaysUntilDeadline(dueDate);
    if (days < 0) return `${Math.abs(days)} dias atrasado`;
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    return `${days} dias`;
  };

  const getDeadlineColor = (dueDate: string) => {
    if (!dueDate) return 'text-muted-foreground';
    const days = getDaysUntilDeadline(dueDate);
    if (days < 0) return 'text-destructive';
    if (days <= 2) return 'text-destructive';
    if (days <= 5) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Atividades Prontas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                Prontas para Iniciar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.availableTasks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Atividades liberadas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividades Bloqueadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-warning" />
                Aguardando Dependências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.blockedTasks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Atividades bloqueadas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impacto na Equipe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                Impacto na Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.teamImpact}
              </div>
              <p className="text-xs text-muted-foreground">
                tarefas da equipe aguardam você
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Atividades Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Atividades Prontas para Iniciar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-success" />
                  Atividades Prontas
                </div>
                <Badge variant="secondary">{stats.availableTasks.length}</Badge>
              </CardTitle>
              <CardDescription>
                Organizadas por prazo - mais urgentes primeiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.availableTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade pronta para iniciar no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {(showAllAvailable ? stats.availableTasks : stats.availableTasks.slice(0, 3))
                    .map(task => (
                    <div key={task.id} className="p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getProjectName(task.project_id)}
                          </p>
                          <p className={`text-xs ${getDeadlineColor(task.due_date)}`}>
                            📅 {formatDeadline(task.due_date)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {task.phase}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stats.availableTasks.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllAvailable(!showAllAvailable)}
                      className="w-full"
                    >
                      {showAllAvailable ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Ver todas ({stats.availableTasks.length - 3} mais)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividades Bloqueadas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-warning" />
                  Atividades Bloqueadas
                </div>
                <Badge variant="secondary">{stats.blockedTasks.length}</Badge>
              </CardTitle>
              <CardDescription>
                Aguardando conclusão de outras atividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.blockedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todas as suas atividades estão liberadas!
                </p>
              ) : (
                <div className="space-y-3">
                  {(showAllBlocked ? stats.blockedTasks : stats.blockedTasks.slice(0, 3))
                    .map(task => {
                      // Encontrar quais tarefas estão bloqueando esta tarefa
                      const blockingRestrictions = restrictions.filter(r =>
                        r.waiting_task_id === task.id && r.status === 'active'
                      );

                      return (
                        <div key={task.id} className="p-3 border rounded-lg border-warning/20 hover:bg-muted/50">
                          <div className="space-y-2">
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {getProjectName(task.project_id)}
                            </p>
                            <p className={`text-xs ${getDeadlineColor(task.due_date)}`}>
                              📅 {formatDeadline(task.due_date)}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Aguardando:</span>
                              <div className="flex flex-wrap gap-1">
                                {blockingRestrictions.slice(0, 2).map(restriction => (
                                  <Badge key={restriction.id} variant="outline" className="text-xs border-warning text-warning">
                                    {restriction.blocking_task_title}
                                  </Badge>
                                ))}
                                {blockingRestrictions.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{blockingRestrictions.length - 2} mais
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {stats.blockedTasks.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllBlocked(!showAllBlocked)}
                      className="w-full"
                    >
                      {showAllBlocked ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Ver todas ({stats.blockedTasks.length - 3} mais)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};