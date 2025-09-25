import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Users,
  Ban,
  Play,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Task } from '@/types';

const ActivitiesDashboard = () => {
  const { user } = useAuth();
  const { tasks, profiles, projects, taskRestrictions } = useSupabaseData();

  // Estados para controlar quantas tarefas mostrar
  const [showReadyCount, setShowReadyCount] = useState(5);
  const [showBlockingCount, setShowBlockingCount] = useState(5);
  const [showBlockedCount, setShowBlockedCount] = useState(5);

  if (!user) return null;

  // Filtrar apenas tarefas do usuário atual
  const userTasks = tasks.filter(task => {
    if (Array.isArray(task.assigned_to)) {
      return task.assigned_to.includes(user.id);
    } else {
      return task.assigned_to === user.id;
    }
  });

  // 1. ATIVIDADES PRONTAS PARA INICIAR
  // Tarefas PENDENTES sem restrições ativas
  const readyToStart = userTasks.filter(task => {
    if (task.status !== 'PENDENTE') return false;

    // Verificar se há restrições ativas para esta tarefa
    const activeRestrictions = taskRestrictions.filter(restriction =>
      restriction.waiting_task_id === task.id && restriction.status === 'active'
    );

    return activeRestrictions.length === 0;
  });

  // 2. ATIVIDADES QUE ESTOU IMPEDINDO OUTROS USUÁRIOS
  // Tarefas minhas que estão bloqueando outras tarefas de outros usuários
  const blockingOthers = userTasks.filter(task => {
    // Verificar se esta tarefa específica está bloqueando outras tarefas
    const restrictionsThisTaskIsBlocking = taskRestrictions.filter(restriction =>
      restriction.blocking_task_id === task.id &&
      restriction.status === 'active'
    );

    // Se não há restrições onde esta tarefa é a bloqueante, não está impedindo ninguém
    if (restrictionsThisTaskIsBlocking.length === 0) return false;

    // Verificar se pelo menos uma das tarefas bloqueadas pertence a outro usuário
    return restrictionsThisTaskIsBlocking.some(restriction => {
      const blockedTask = tasks.find(t => t.id === restriction.waiting_task_id);
      if (!blockedTask) return false;

      const blockedTaskUsers = Array.isArray(blockedTask.assigned_to)
        ? blockedTask.assigned_to
        : [blockedTask.assigned_to];

      // A tarefa bloqueada deve pertencer a outro usuário (não a mim)
      return !blockedTaskUsers.includes(user.id);
    });
  });

  // 3. ATIVIDADES BLOQUEADAS
  // Tarefas PENDENTES que estão aguardando outras tarefas serem concluídas
  const blockedTasks = userTasks.filter(task => {
    if (task.status !== 'PENDENTE') return false;

    // Verificar se há restrições ativas para esta tarefa
    const activeRestrictions = taskRestrictions.filter(restriction =>
      restriction.waiting_task_id === task.id && restriction.status === 'active'
    );

    return activeRestrictions.length > 0;
  });

  // 4. ATIVIDADES EM ANDAMENTO
  // Tarefas que estão sendo trabalhadas atualmente
  const inProgressTasks = userTasks.filter(task => task.status === 'EM_ANDAMENTO');

  // 5. ATIVIDADES COM PRAZO PRÓXIMO (próximos 7 dias)
  const upcomingDeadlines = userTasks.filter(task => {
    if (!task.due_date || task.status === 'CONCLUIDA') return false;

    const dueDate = new Date(task.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 7;
  });

  // 6. ATIVIDADES ATRASADAS
  const overdueTasks = userTasks.filter(task => {
    if (!task.due_date || task.status === 'CONCLUIDA') return false;

    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projeto não encontrado';
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const priorityConfig = {
      'alta': { label: 'Alta', className: 'bg-destructive text-destructive-foreground' },
      'media': { label: 'Média', className: 'bg-warning text-warning-foreground' },
      'baixa': { label: 'Baixa', className: 'bg-success text-success-foreground' }
    };

    const config = priorityConfig[priority];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    // Se a data está no formato YYYY-MM-DD, usar diretamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    // Para outros formatos, usar Date com meio-dia para evitar problemas de timezone
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const TaskCard = ({ task, variant = 'default' }: { task: Task, variant?: 'ready' | 'blocking' | 'blocked' | 'default' }) => {
    const borderColor = {
      ready: 'border-l-success',
      blocking: 'border-l-warning',
      blocked: 'border-l-destructive',
      default: 'border-l-muted'
    }[variant];

    return (
      <Card className={`hover:shadow-md transition-shadow border-l-4 ${borderColor}`}>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{task.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {getProjectName(task.project_id)}
                </p>
              </div>
              {getPriorityBadge(task.priority)}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {task.due_date ? `Prazo: ${formatDate(task.due_date)}` : 'Sem prazo'}
              </span>
            </div>

            {variant === 'blocked' && (
              <div className="mt-2 pt-2 border-t border-muted">
                <p className="text-xs text-muted-foreground">
                  <Ban className="h-3 w-3 inline mr-1" />
                  Aguardando outras atividades
                </p>
              </div>
            )}

            {variant === 'blocking' && (
              <div className="mt-2 pt-2 border-t border-muted">
                <p className="text-xs text-warning">
                  <UserCheck className="h-3 w-3 inline mr-1" />
                  Outros usuários aguardam esta tarefa
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontas para Iniciar</CardTitle>
              <Play className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{readyToStart.length}</div>
              <p className="text-xs text-muted-foreground">
                Sem impedimentos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impedindo Outros</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{blockingOthers.length}</div>
              <p className="text-xs text-muted-foreground">
                Priorize estas tarefas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
              <Ban className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{blockedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando dependências
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Timer className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{inProgressTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Tarefas sendo trabalhadas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prazos Próximos</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{upcomingDeadlines.length}</div>
              <p className="text-xs text-muted-foreground">
                Vencem em 7 dias
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Tarefas vencidas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activities Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prontas para Iniciar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-success">
                <Play className="h-5 w-5 mr-2" />
                Prontas para Iniciar
              </CardTitle>
              <CardDescription>
                Atividades que você pode começar agora
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readyToStart.length > 0 ? (
                <div className="space-y-3">
                  {readyToStart.slice(0, showReadyCount).map(task => (
                    <TaskCard key={task.id} task={task} variant="ready" />
                  ))}
                  {readyToStart.length > showReadyCount && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReadyCount(prev => prev + 5)}
                        className="text-xs"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Ver mais {Math.min(5, readyToStart.length - showReadyCount)} atividades
                      </Button>
                    </div>
                  )}
                  {showReadyCount > 5 && readyToStart.length <= showReadyCount && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReadyCount(5)}
                        className="text-xs"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Mostrar menos
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ✨ Todas as suas tarefas pendentes têm dependências
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Impedindo Outros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-warning">
                <Users className="h-5 w-5 mr-2" />
                Impedindo Outros
              </CardTitle>
              <CardDescription>
                Suas tarefas que outros aguardam
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockingOthers.length > 0 ? (
                <div className="space-y-3">
                  {blockingOthers.slice(0, showBlockingCount).map(task => (
                    <TaskCard key={task.id} task={task} variant="blocking" />
                  ))}
                  {blockingOthers.length > showBlockingCount && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBlockingCount(prev => prev + 5)}
                        className="text-xs"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Ver mais {Math.min(5, blockingOthers.length - showBlockingCount)} atividades
                      </Button>
                    </div>
                  )}
                  {showBlockingCount > 5 && blockingOthers.length <= showBlockingCount && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBlockingCount(5)}
                        className="text-xs"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Mostrar menos
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  👏 Você não está impedindo nenhum colega
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bloqueadas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <Ban className="h-5 w-5 mr-2" />
                Atividades Bloqueadas
              </CardTitle>
              <CardDescription>
                Aguardando outras tarefas serem concluídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockedTasks.length > 0 ? (
                <div className="space-y-3">
                  {blockedTasks.slice(0, showBlockedCount).map(task => (
                    <TaskCard key={task.id} task={task} variant="blocked" />
                  ))}
                  {blockedTasks.length > showBlockedCount && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBlockedCount(prev => prev + 5)}
                        className="text-xs"
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Ver mais {Math.min(5, blockedTasks.length - showBlockedCount)} atividades
                      </Button>
                    </div>
                  )}
                  {showBlockedCount > 5 && blockedTasks.length <= showBlockedCount && (
                    <div className="flex justify-center pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBlockedCount(5)}
                        className="text-xs"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Mostrar menos
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  🎯 Nenhuma tarefa bloqueada
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </div>
  );
};

export default ActivitiesDashboard;