import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Filter, Trophy, Edit, Plus, Search, PauseCircle, PlayCircle, XCircle, CircleCheckBig } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';
import TaskModal from '@/components/TaskModal';

const MinhasTarefas = () => {
  const { user } = useAuth();
  const { projects, getTasksByUser, tasks } = useSupabaseData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('todas');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('todos');
  const [phaseFilter, setPhaseFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('todos');

  if (!user) return null;

  // Admin vê todas as tarefas, usuários comuns veem apenas as suas
  const isAdmin = user.role === 'admin';
  const userTasks = isAdmin ? tasks : getTasksByUser(user.id);

  // Debug logs
  console.log('MinhasTarefas - Current user:', user);
  console.log('MinhasTarefas - isAdmin:', isAdmin);
  console.log('MinhasTarefas - All tasks:', tasks);
  console.log('MinhasTarefas - User tasks:', userTasks);


  const filteredTasks = userTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProject = projectFilter === 'todos' || task.project_id === projectFilter;

    const matchesPhase = phaseFilter === 'todos' || task.phase === phaseFilter;

    const matchesPriority = priorityFilter === 'todos' || task.priority === priorityFilter;

    const matchesResponsible = responsibleFilter === 'todos' ||
      (Array.isArray(task.assigned_to) ? task.assigned_to.includes(responsibleFilter) : task.assigned_to === responsibleFilter);

    // Filtro de prazo
    let matchesDeadline = true;
    if (deadlineFilter !== 'todos' && task.due_date) {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (deadlineFilter) {
        case 'atrasadas':
          matchesDeadline = dueDate < today;
          break;
        case 'hoje':
          matchesDeadline = dueDate.toDateString() === today.toDateString();
          break;
        case 'proximos_7':
          const em7Dias = new Date();
          em7Dias.setDate(today.getDate() + 7);
          matchesDeadline = dueDate >= today && dueDate <= em7Dias;
          break;
        case 'proximos_30':
          const em30Dias = new Date();
          em30Dias.setDate(today.getDate() + 30);
          matchesDeadline = dueDate >= today && dueDate <= em30Dias;
          break;
      }
    }

    return matchesSearch && matchesProject && matchesPhase && matchesPriority && matchesResponsible && matchesDeadline;
  });

  const getTasksByStatus = (status?: Task['status']) => {
    if (!status) return filteredTasks;
    return filteredTasks.filter(task => task.status === status);
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
      'PENDENTE': { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
      'EM_ANDAMENTO': { label: 'Em Andamento', className: 'bg-primary text-primary-foreground' },
      'CONCLUIDA': { label: 'Concluída', className: 'bg-success text-success-foreground' },
      'PARALISADA': { label: 'Paralisada', className: 'bg-destructive text-destructive-foreground' },
      'EM_ESPERA': { label: 'Em Espera', className: 'bg-warning text-warning-foreground' }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getProjectNameWithClient = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Projeto não encontrado';
    return `${project.name} - ${project.client}`;
  };

  const getAssignedUserName = (assignedTo: string | string[]) => {
    const teamMembers = [
      { id: '1', name: 'Igor' },
      { id: '2', name: 'Gustavo' },
      { id: '3', name: 'Bessa' },
      { id: '4', name: 'Leonardo' },
      { id: '5', name: 'Pedro' },
      { id: '6', name: 'Thiago' },
      { id: '7', name: 'Nicolas' },
      { id: '8', name: 'Eloisy' },
      { id: '9', name: 'Rondinelly' },
      { id: '10', name: 'Edilson' },
      { id: '11', name: 'Philip' },
      { id: '12', name: 'Nara' },
      { id: '13', name: 'Stael' },
      { id: '14', name: 'Projetista Externo' }
    ];

    if (Array.isArray(assignedTo)) {
      const names = assignedTo.map(userId => {
        const member = teamMembers.find(member => member.id === userId);
        return member?.name || 'Não encontrado';
      });
      return names.length > 0 ? names.join(', ') : 'Não atribuído';
    } else {
      const member = teamMembers.find(member => member.id === assignedTo);
      return member?.name || 'Não atribuído';
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalMode('create');
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
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
      <Card className={`hover:shadow-md transition-shadow border-l-4 ${
        task.status === 'PENDENTE' ? 'border-l-muted' :
        task.status === 'EM_ANDAMENTO' ? 'border-l-primary' :
        task.status === 'CONCLUIDA' ? 'border-l-success' :
        task.status === 'PARALISADA' ? 'border-l-destructive' :
        task.status === 'EM_ESPERA' ? 'border-l-warning' : 'border-l-muted'
      }`}>
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
              
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Projeto: {getProjectNameWithClient(task.project_id)}</span>
                  {isAdmin && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Atribuído a: {getAssignedUserName(task.assigned_to)}</span>
                    </>
                  )}
                  <span className="hidden sm:inline">•</span>
                  <span className={isOverdue(task.due_date) ? 'text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-md' : ''}>
                    Prazo: {formatDate(task.due_date)}
                    {isOverdue(task.due_date) && ' ⚠️ ATRASADO'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {task.activity_start && (
                    <>
                      <span>Início: {formatDate(task.activity_start)}</span>
                      <span className="hidden sm:inline">•</span>
                    </>
                  )}
                  {task.last_delivery && (
                    <span className="text-success font-medium">
                      Entrega realizada: {formatDate(task.last_delivery)}
                    </span>
                  )}
                  {!task.activity_start && task.status === 'PENDENTE' && (
                    <span className="text-warning">Não iniciada</span>
                  )}
                </div>
              </div>

              {/* Mostrar dependências se existirem */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Restrições (necessário concluir antes):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {task.dependencies.map((dependency) => (
                      <Badge
                        key={dependency}
                        variant="secondary"
                        className="text-xs"
                      >
                        {dependency}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditTask(task)}
                className="whitespace-nowrap"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? 'Todas as Tarefas' : 'Minhas Tarefas'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Visualize e gerencie todas as tarefas do sistema'
              : 'Gerencie suas tarefas e acompanhe seu progresso'
            }
          </p>
        </div>

        {isAdmin && (
          <Button className="w-full sm:w-auto" onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        )}
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar tarefas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Projetos</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name} - {project.client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Fase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Fases</SelectItem>
                    <SelectItem value="ESTUDO_PRELIMINAR">Estudo Preliminar</SelectItem>
                    <SelectItem value="PROJETO_BASICO">Projeto Básico</SelectItem>
                    <SelectItem value="EXECUTIVO">Executivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas Prioridades</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                {isAdmin && (
                  <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos Responsáveis</SelectItem>
                      <SelectItem value="1">Igor</SelectItem>
                      <SelectItem value="2">Gustavo</SelectItem>
                      <SelectItem value="3">Bessa</SelectItem>
                      <SelectItem value="4">Leonardo</SelectItem>
                      <SelectItem value="5">Pedro</SelectItem>
                      <SelectItem value="6">Thiago</SelectItem>
                      <SelectItem value="7">Nicolas</SelectItem>
                      <SelectItem value="8">Eloisy</SelectItem>
                      <SelectItem value="9">Rondinelly</SelectItem>
                      <SelectItem value="10">Edilson</SelectItem>
                      <SelectItem value="11">Stael</SelectItem>
                      <SelectItem value="12">Philip</SelectItem>
                      <SelectItem value="13">Nara</SelectItem>
                      <SelectItem value="14">Projetista Externo</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Prazos</SelectItem>
                    <SelectItem value="atrasadas">Atrasadas</SelectItem>
                    <SelectItem value="hoje">Vencem hoje</SelectItem>
                    <SelectItem value="proximos_7">Próximos 7 dias</SelectItem>
                    <SelectItem value="proximos_30">Próximos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{filteredTasks.filter(task => task.status === 'PENDENTE').length}</p>
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
                <PlayCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{filteredTasks.filter(task => task.status === 'EM_ANDAMENTO').length}</p>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
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
                <CircleCheckBig className="h-4 w-4 text-success" />
                <div>
                  <p className="text-2xl font-bold">{filteredTasks.filter(task => task.status === 'CONCLUIDA').length}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <PauseCircle className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{filteredTasks.filter(task => task.status === 'EM_ESPERA').length}</p>
                  <p className="text-xs text-muted-foreground">Em Espera</p>
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
                <XCircle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{filteredTasks.filter(task => task.status === 'PARALISADA').length}</p>
                  <p className="text-xs text-muted-foreground">Paralisadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredTasks.reduce((sum, task) => sum + task.points, 0)}
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="PENDENTE">Pendentes</TabsTrigger>
            <TabsTrigger value="EM_ANDAMENTO">Em Andamento</TabsTrigger>
            <TabsTrigger value="EM_ESPERA">Em Espera</TabsTrigger>
            <TabsTrigger value="PARALISADA">Paralisadas</TabsTrigger>
            <TabsTrigger value="CONCLUIDA">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-6">
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="PENDENTE" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('PENDENTE').length > 0 ? (
                getTasksByStatus('PENDENTE').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa pendente</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="EM_ANDAMENTO" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('EM_ANDAMENTO').length > 0 ? (
                getTasksByStatus('EM_ANDAMENTO').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa em andamento</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="EM_ESPERA" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('EM_ESPERA').length > 0 ? (
                getTasksByStatus('EM_ESPERA').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa em espera</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="PARALISADA" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('PARALISADA').length > 0 ? (
                getTasksByStatus('PARALISADA').map(renderTaskCard)
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa paralisada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="CONCLUIDA" className="mt-6">
            <div className="space-y-4">
              {getTasksByStatus('CONCLUIDA').length > 0 ? (
                getTasksByStatus('CONCLUIDA').map(renderTaskCard)
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

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  );
};

export default MinhasTarefas;