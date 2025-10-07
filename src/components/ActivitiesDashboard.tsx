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
  Timer,
  Eye,
  X
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

  // Estados para o modal de detalhes da tarefa bloqueadora
  const [selectedBlockingTask, setSelectedBlockingTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
    const isBlocking = restrictionsThisTaskIsBlocking.some(restriction => {
      const blockedTask = tasks.find(t => t.id === restriction.waiting_task_id);
      if (!blockedTask) return false;

      const blockedTaskUsers = Array.isArray(blockedTask.assigned_to)
        ? blockedTask.assigned_to
        : [blockedTask.assigned_to];

      // A tarefa bloqueada deve pertencer a outro usuário (não a mim)
      const isBlockingOthers = !blockedTaskUsers.includes(user.id);


      return isBlockingOthers;
    });

    return isBlocking;
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

  // Função para obter detalhes das tarefas que estão aguardando uma tarefa específica
  const getWaitingTasksDetails = (blockingTaskId: string) => {
    const restrictions = taskRestrictions.filter(
      restriction => restriction.blocking_task_id === blockingTaskId && restriction.status === 'active'
    );

    return restrictions.map(restriction => {
      const waitingTask = tasks.find(t => t.id === restriction.waiting_task_id);
      if (!waitingTask) return null;

      const assignedUsers = Array.isArray(waitingTask.assigned_to)
        ? waitingTask.assigned_to
        : [waitingTask.assigned_to];

      const userNames = assignedUsers.map(userId => {
        const profile = profiles.find(p => p.id === userId);
        return profile?.full_name || profile?.email || 'Usuário não encontrado';
      });

      return {
        task: waitingTask,
        userNames,
        project: projects.find(p => p.id === waitingTask.project_id)
      };
    }).filter(Boolean);
  };

  // Função para abrir o modal de detalhes
  const handleShowBlockingDetails = (task: Task) => {
    setSelectedBlockingTask(task);
    setIsDetailsModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseDetails = () => {
    setSelectedBlockingTask(null);
    setIsDetailsModalOpen(false);
  };

  const TaskCard = ({ task, variant = 'default' }: { task: Task, variant?: 'ready' | 'blocking' | 'blocked' | 'default' }) => {
    const borderColor = {
      ready: 'border-l-success',
      blocking: 'border-l-warning',
      blocked: 'border-l-destructive',
      default: 'border-l-muted'
    }[variant];

    // Para tarefas que estão bloqueando outros, contar quantas pessoas estão aguardando
    const waitingTasksDetails = variant === 'blocking' ? getWaitingTasksDetails(task.id) : [];
    const totalWaitingUsers = waitingTasksDetails.reduce((acc, detail) => acc + (detail?.userNames.length || 0), 0);

    const isClickable = variant === 'blocking';

    return (
      <Card
        className={`hover:shadow-md transition-shadow border-l-4 ${borderColor} ${
          isClickable ? 'cursor-pointer hover:bg-muted/50' : ''
        }`}
        onClick={isClickable ? () => handleShowBlockingDetails(task) : undefined}
      >
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{task.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {getProjectName(task.project_id)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(task.priority)}
                {isClickable && (
                  <Eye className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
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
                <div className="flex items-center justify-between">
                  <p className="text-xs text-warning">
                    <UserCheck className="h-3 w-3 inline mr-1" />
                    {totalWaitingUsers} {totalWaitingUsers === 1 ? 'pessoa aguarda' : 'pessoas aguardam'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique para ver detalhes
                  </p>
                </div>
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

      {/* Modal de Detalhes das Tarefas Aguardando */}
      {isDetailsModalOpen && selectedBlockingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Detalhes da Atividade Bloqueadora
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedBlockingTask.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetails}
                className="hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Informações da tarefa bloqueadora */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-warning flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Tarefa Bloqueadora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Projeto:</p>
                      <p className="font-medium">{getProjectName(selectedBlockingTask.project_id)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prazo:</p>
                      <p className="font-medium">
                        {selectedBlockingTask.due_date
                          ? formatDate(selectedBlockingTask.due_date)
                          : 'Sem prazo definido'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status:</p>
                      <Badge variant={selectedBlockingTask.status === 'EM_ANDAMENTO' ? 'default' : 'secondary'}>
                        {selectedBlockingTask.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prioridade:</p>
                      {getPriorityBadge(selectedBlockingTask.priority)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de usuários e atividades aguardando */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-destructive flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Usuários e Atividades Aguardando
                  </CardTitle>
                  <CardDescription>
                    {(() => {
                      const waitingDetails = getWaitingTasksDetails(selectedBlockingTask.id);
                      const totalUsers = waitingDetails.reduce((acc, detail) => acc + (detail?.userNames.length || 0), 0);
                      return `${totalUsers} ${totalUsers === 1 ? 'pessoa aguarda' : 'pessoas aguardam'} esta tarefa ser concluída`;
                    })()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getWaitingTasksDetails(selectedBlockingTask.id).map((detail, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{detail?.task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {detail?.project?.name} - {detail?.project?.client}
                            </p>
                          </div>
                          {detail?.task.priority && getPriorityBadge(detail.task.priority)}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {detail?.task.due_date
                              ? `Prazo: ${formatDate(detail.task.due_date)}`
                              : 'Sem prazo'
                            }
                          </span>
                        </div>

                        <div className="pt-2 border-t border-muted">
                          <p className="text-xs text-muted-foreground mb-2">
                            {detail?.userNames.length === 1 ? 'Responsável:' : 'Responsáveis:'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {detail?.userNames.map((userName, userIndex) => (
                              <Badge key={userIndex} variant="outline" className="text-xs">
                                {userName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end p-6 border-t bg-muted/50">
              <Button onClick={handleCloseDetails} variant="outline">
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ActivitiesDashboard;