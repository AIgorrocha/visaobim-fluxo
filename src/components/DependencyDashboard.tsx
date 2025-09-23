import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

interface DependencyStats {
  availableTasks: any[];
  blockingTasks: any[];
  criticalDeadlines: any[];
  affectedUsers: string[];
  teamImpact: number;
}

export const DependencyDashboard = () => {
  const { user } = useAuth();
  const { tasks, profiles, projects } = useSupabaseData();

  if (!user) return null;

  // Calcular estatísticas de dependências
  const calculateDependencyStats = (): DependencyStats => {
    const userTasks = tasks.filter(task => 
      Array.isArray(task.assigned_to) 
        ? task.assigned_to.includes(user.id)
        : task.assigned_to === user.id
    );

    // 1. Tarefas disponíveis (sem dependências bloqueadas)
    const availableTasks = userTasks.filter(task => {
      if (task.status !== 'PENDENTE') return false;
      
      if (!task.restricoes) return true;
      
      try {
        const restrictions = typeof task.restricoes === 'string' 
          ? JSON.parse(task.restricoes)
          : task.restricoes;
        
        if (!Array.isArray(restrictions) || restrictions.length === 0) return true;
        
        const blockedByUsers = restrictions.filter(userId => {
          const dependencyUserTasks = tasks.filter(t => 
            Array.isArray(t.assigned_to) 
              ? t.assigned_to.includes(userId)
              : t.assigned_to === userId
          );
          
          return dependencyUserTasks.some(t => 
            t.project_id === task.project_id && 
            (t.status === 'PENDENTE' || t.status === 'EM_ANDAMENTO')
          );
        });
        
        return blockedByUsers.length === 0;
      } catch {
        return true;
      }
    });

    // 2. Tarefas que o usuário está bloqueando
    const blockingTasks = userTasks.filter(task => 
      task.status === 'PENDENTE' || task.status === 'EM_ANDAMENTO'
    ).filter(task => {
      const dependentTasks = tasks.filter(t => {
        if (!t.restricoes) return false;
        try {
          const restrictions = typeof t.restricoes === 'string' 
            ? JSON.parse(t.restricoes)
            : t.restricoes;
          return Array.isArray(restrictions) && restrictions.includes(user.id);
        } catch {
          return false;
        }
      });
      return dependentTasks.length > 0;
    });

    // 3. Prazos críticos
    const criticalDeadlines = userTasks.filter(task => {
      const daysUntilDeadline = Math.ceil(
        (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline > 3) return false;
      
      const dependentTasks = tasks.filter(t => {
        if (!t.restricoes) return false;
        try {
          const restrictions = typeof t.restricoes === 'string' 
            ? JSON.parse(t.restricoes)
            : t.restricoes;
          return Array.isArray(restrictions) && restrictions.includes(user.id);
        } catch {
          return false;
        }
      });
      
      return dependentTasks.length > 0;
    });

    // 4. Usuários afetados
    const affectedUsers = blockingTasks.flatMap(task => {
      const dependentTasks = tasks.filter(t => {
        if (!t.restricoes) return [];
        try {
          const restrictions = typeof t.restricoes === 'string' 
            ? JSON.parse(t.restricoes)
            : t.restricoes;
          return Array.isArray(restrictions) && restrictions.includes(user.id);
        } catch {
          return [];
        }
      });
      
      return dependentTasks.flatMap(t => 
        Array.isArray(t.assigned_to) ? t.assigned_to : [t.assigned_to]
      );
    }).filter(id => id !== user.id);

    const uniqueAffectedUsers = [...new Set(affectedUsers)];
    
    // 5. Impacto na equipe (número de tarefas que serão liberadas)
    const teamImpact = tasks.filter(t => {
      if (!t.restricoes) return false;
      try {
        const restrictions = typeof t.restricoes === 'string' 
          ? JSON.parse(t.restricoes)
          : t.restricoes;
        return Array.isArray(restrictions) && restrictions.includes(user.id);
      } catch {
        return false;
      }
    }).length;

    return {
      availableTasks,
      blockingTasks,
      criticalDeadlines,
      affectedUsers: uniqueAffectedUsers,
      teamImpact
    };
  };

  const stats = calculateDependencyStats();
  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || 'Usuário';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.name} - ${project.client}` : 'Projeto';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Tarefas Liberadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                Tarefas Liberadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.availableTasks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Prontas para iniciar agora
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Você está segurando */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-warning" />
                Você está segurando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.affectedUsers.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.affectedUsers.length === 1 ? 'pessoa' : 'pessoas'} aguardando
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prazos Críticos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                Prazos Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.criticalDeadlines.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Afetando a equipe
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impacto na Equipe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
                tarefas serão liberadas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Tarefas Disponíveis Detalhadas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-success" />
                Tarefas Prontas para Iniciar
              </CardTitle>
              <CardDescription>
                Sem dependências bloqueadas - você pode começar agora!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.availableTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todas as suas tarefas têm dependências pendentes ou já foram iniciadas.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.availableTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getProjectName(task.project_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-success border-success">
                          {task.points} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {stats.availableTasks.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{stats.availableTasks.length - 3} tarefas adicionais
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pessoas Aguardando */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-warning" />
                Pessoas Aguardando Você
              </CardTitle>
              <CardDescription>
                Seus colegas dependem da conclusão das suas tarefas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.affectedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ótimo! Você não está bloqueando ninguém no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.blockingTasks.slice(0, 3).map(task => {
                    const dependentTasks = tasks.filter(t => {
                      if (!t.restricoes) return false;
                      try {
                        const restrictions = typeof t.restricoes === 'string' 
                          ? JSON.parse(t.restricoes)
                          : t.restricoes;
                        return Array.isArray(restrictions) && restrictions.includes(user.id);
                      } catch {
                        return false;
                      }
                    });

                    const waitingUsers = dependentTasks.flatMap(t => 
                      Array.isArray(t.assigned_to) ? t.assigned_to : [t.assigned_to]
                    ).filter(id => id !== user.id);

                    return (
                      <div key={task.id} className="p-3 border rounded-lg border-warning/20">
                        <div className="space-y-2">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getProjectName(task.project_id)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Aguardando:</span>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(waitingUsers)].slice(0, 2).map(userId => (
                                <Badge key={userId} variant="secondary" className="text-xs">
                                  {getUserName(userId)}
                                </Badge>
                              ))}
                              {[...new Set(waitingUsers)].length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{[...new Set(waitingUsers)].length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};