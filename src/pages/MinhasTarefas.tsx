import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Filter, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

const MinhasTarefas = () => {
  const { user, updateUserPoints } = useAuth();
  const { getTasksByUser, projects, updateTaskStatus } = useAppData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('todas');

  if (!user) return null;

  const userTasks = getTasksByUser(user.id);

  const getTasksByStatus = (status?: Task['status']) => {
    if (!status) return userTasks;
    return userTasks.filter(task => task.status === status);
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'media':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'baixa':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return null;
    }
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

  const getStatusBadge = (status: Task['status']) => {
    const statusConfig = {
      'pendente': { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
      'em_progresso': { label: 'Em Progresso', className: 'bg-primary text-primary-foreground' },
      'concluida': { label: 'Concluída', className: 'bg-success text-success-foreground' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Projeto não encontrado';
  };

  const handleCompleteTask = (taskId: string) => {
    const task = userTasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'concluida') {
      toast({
        title: "Informação",
        description: "Esta tarefa já foi concluída!",
        variant: "default",
      });
      return;
    }

    // Update task status
    updateTaskStatus(taskId, 'concluida');

    // Update user points
    updateUserPoints(user.points + task.points);

    toast({
      title: "Sucesso!",
      description: `Tarefa concluída! Você ganhou ${task.points} pontos!`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const renderTaskCard = (task: Task) => (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(task.priority)}
                <h3 className="font-semibold text-lg">{task.title}</h3>
              </div>
              
              {task.description && (
                <p className="text-muted-foreground text-sm">{task.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
                <Badge variant="outline">
                  <Trophy className="h-3 w-3 mr-1" />
                  {task.points} pontos
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                <span>Projeto: {getProjectName(task.project_id)}</span>
                <span className="hidden sm:inline">•</span>
                <span className={isOverdue(task.due_date) ? 'text-destructive font-medium' : ''}>
                  Prazo: {formatDate(task.due_date)}
                  {isOverdue(task.due_date) && ' (Atrasado)'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {task.status !== 'concluida' && (
                <Button
                  size="sm"
                  onClick={() => handleCompleteTask(task.id)}
                  className="whitespace-nowrap"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Concluída
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Minhas Tarefas</h1>
        <p className="text-muted-foreground">
          Gerencie suas tarefas e acompanhe seu progresso
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold">{getTasksByStatus('pendente').length}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold">{getTasksByStatus('em_progresso').length}</p>
                  <p className="text-xs text-muted-foreground">Em Progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold">{getTasksByStatus('concluida').length}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">
                    {userTasks.reduce((sum, task) => sum + task.points, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Pontos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tasks Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="em_progresso">Em Progresso</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-6">
            <div className="space-y-4">
              {userTasks.length > 0 ? (
                userTasks.map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pendente" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('pendente').length > 0 ? (
                getTasksByStatus('pendente').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa pendente</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="em_progresso" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('em_progresso').length > 0 ? (
                getTasksByStatus('em_progresso').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa em progresso</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="concluida" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('concluida').length > 0 ? (
                getTasksByStatus('concluida').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa concluída</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default MinhasTarefas;