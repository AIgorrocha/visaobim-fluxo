import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Filter, Edit, Plus, Search, PauseCircle, PlayCircle, XCircle, CircleCheckBig, Eye, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';
import TaskModal from '@/components/TaskModal';

const MinhasTarefas = () => {
  const { user, profile } = useAuth();
  const { projects, getTasksByUser, tasks, profiles, taskRestrictions } = useSupabaseData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('todas');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('edit');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('todos');
  const [phaseFilter, setPhaseFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('todos');
  const [restrictionFilter, setRestrictionFilter] = useState<string>('todos');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  if (!user) return null;

  // Admin vê todas as tarefas, usuários comuns veem apenas as suas
  const isAdmin = profile?.role === 'admin';
  const userTasks = isAdmin ? tasks : tasks.filter(task => {
    if (Array.isArray(task.assigned_to)) {
      return task.assigned_to.includes(user.id);
    } else {
      return task.assigned_to === user.id;
    }
  });

  // Funções para determinar status de restrições
  const isTaskBlocked = (task: Task) => {
    if (task.status !== 'PENDENTE') return false;
    return taskRestrictions.some(restriction =>
      restriction.waiting_task_id === task.id &&
      restriction.status === 'active'
    );
  };

  const isTaskBlockingOthers = (task: Task) => {
    return taskRestrictions.some(restriction =>
      restriction.blocking_task_id === task.id &&
      restriction.status === 'active'
    );
  };

  const isTaskReadyToStart = (task: Task) => {
    if (task.status !== 'PENDENTE') return false;
    return !taskRestrictions.some(restriction =>
      restriction.waiting_task_id === task.id &&
      restriction.status === 'active'
    );
  };


  const filteredAndSortedTasks = userTasks.filter(task => {
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
        case 'proximos_7': {
          const em7Dias = new Date();
          em7Dias.setDate(today.getDate() + 7);
          matchesDeadline = dueDate >= today && dueDate <= em7Dias;
          break;
        }
        case 'proximos_15': {
          const em15Dias = new Date();
          em15Dias.setDate(today.getDate() + 15);
          matchesDeadline = dueDate >= today && dueDate <= em15Dias;
          break;
        }
        case 'proximos_30': {
          const em30Dias = new Date();
          em30Dias.setDate(today.getDate() + 30);
          matchesDeadline = dueDate >= today && dueDate <= em30Dias;
          break;
        }
      }
    }

    // Filtro de restrições
    let matchesRestriction = true;
    if (restrictionFilter !== 'todos') {
      switch (restrictionFilter) {
        case 'bloqueadas':
          matchesRestriction = isTaskBlocked(task);
          break;
        case 'prontas':
          matchesRestriction = isTaskReadyToStart(task);
          break;
        case 'bloqueando_outros':
          matchesRestriction = isTaskBlockingOthers(task);
          break;
      }
    }

    // Filtros de status
    const matchesCompletedFilter = showCompleted || task.status !== 'CONCLUIDA';
    const matchesArchivedFilter = showArchived ? true : !task.is_archived;

    return matchesSearch && matchesProject && matchesPhase && matchesPriority && matchesResponsible && matchesDeadline && matchesRestriction && matchesCompletedFilter && matchesArchivedFilter;
  }).sort((a, b) => {
    // Tarefas sem prazo ficam no início
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return -1;
    if (!b.due_date) return 1;

    // Ordenar por prazo (mais próximo primeiro)
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const getTasksByStatus = (status?: Task['status']) => {
    if (!status) return filteredAndSortedTasks;
    return filteredAndSortedTasks.filter(task => task.status === status);
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

  const getRestrictionSituationBadge = (task: Task) => {
    // Se a tarefa está concluída
    if (task.status === 'CONCLUIDA') {
      return <Badge className="bg-success text-success-foreground">Finalizada</Badge>;
    }

    // Para todas as outras tarefas, verificar restrições
    // Verificar se está bloqueada
    if (isTaskBlocked(task)) {
      return <Badge className="bg-destructive text-destructive-foreground">Bloqueada</Badge>;
    }

    // Verificar se está bloqueando outros
    if (isTaskBlockingOthers(task)) {
      return <Badge className="bg-warning text-warning-foreground">Bloqueando</Badge>;
    }

    // Todas as outras situações = Pronta para iniciar
    return <Badge className="bg-success text-success-foreground">Pronta</Badge>;
  };

  const getProjectNameWithClient = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Projeto não encontrado';
    return `${project.name} - ${project.client}`;
  };

  const getAssignedUserName = (assignedTo: string | string[]) => {
    if (Array.isArray(assignedTo)) {
      const names = assignedTo.map(userId => {
        const profile = profiles.find(p => p.id === userId);
        return profile?.full_name || profile?.email || 'Não encontrado';
      });
      return names.length > 0 ? names.join(', ') : 'Não atribuído';
    } else {
      const profile = profiles.find(p => p.id === assignedTo);
      return profile?.full_name || profile?.email || 'Não atribuído';
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setModalMode('view');
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
    if (!dateString) return '';

    // Se a data está no formato YYYY-MM-DD, usar diretamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    // Para outros formatos, usar Date com meio-dia para evitar problemas de timezone
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate.includes('T') ? dueDate : dueDate + 'T12:00:00');
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const renderTaskRow = (task: Task) => (
    <TableRow key={task.id} className="hover:bg-muted/50">
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell>
        <div className="max-w-48 truncate" title={getProjectNameWithClient(task.project_id)}>
          {getProjectNameWithClient(task.project_id)}
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell>{getRestrictionSituationBadge(task)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {task.phase}
        </Badge>
      </TableCell>
      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
      <TableCell className="text-sm">
        {task.activity_start ? formatDate(task.activity_start) : 'Não iniciada'}
      </TableCell>
      <TableCell className={`text-sm ${
        task.due_date && isOverdue(task.due_date) ? 'text-destructive font-semibold' : ''
      }`}>
        {task.due_date ? (
          <>
            {formatDate(task.due_date)}
            {isOverdue(task.due_date) && ' ⚠️'}
          </>
        ) : (
          <span className="text-muted-foreground">Sem prazo</span>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {task.last_delivery ? (
          <span className="text-success font-medium">{formatDate(task.last_delivery)}</span>
        ) : (
          <span className="text-muted-foreground">Não realizada</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewTask(task)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

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
                {getRestrictionSituationBadge(task)}
                {getPriorityBadge(task.priority)}
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
                onClick={() => handleViewTask(task)}
                className="whitespace-nowrap"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isAdmin ? 'Todas as Tarefas' : 'Minhas Tarefas'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isAdmin
              ? 'Visualize e gerencie todas as tarefas do sistema'
              : 'Gerencie suas tarefas e acompanhe seu progresso'
            }
          </p>
        </div>

        <Button className="w-full sm:w-auto" onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
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
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || profile.email}
                        </SelectItem>
                      ))}
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
                    <SelectItem value="proximos_15">Próximos 15 dias</SelectItem>
                    <SelectItem value="proximos_30">Próximos 30 dias</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={restrictionFilter} onValueChange={setRestrictionFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Restrições" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Situações</SelectItem>
                    <SelectItem value="prontas">Prontas para Iniciar</SelectItem>
                    <SelectItem value="bloqueadas">Bloqueadas</SelectItem>
                    <SelectItem value="bloqueando_outros">Bloqueando</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros de visualização */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-completed"
                    checked={showCompleted}
                    onCheckedChange={(checked) => setShowCompleted(checked === true)}
                  />
                  <label
                    htmlFor="show-completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Mostrar concluídas
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-archived"
                    checked={showArchived}
                    onCheckedChange={(checked) => setShowArchived(checked === true)}
                  />
                  <label
                    htmlFor="show-archived"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                  >
                    <Archive className="h-3 w-3" />
                    Mostrar arquivadas
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <p className="text-2xl font-bold">{filteredAndSortedTasks.filter(task => task.status === 'PENDENTE').length}</p>
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
                  <p className="text-2xl font-bold">{filteredAndSortedTasks.filter(task => task.status === 'EM_ANDAMENTO').length}</p>
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
                  <p className="text-2xl font-bold">{filteredAndSortedTasks.filter(task => task.status === 'CONCLUIDA').length}</p>
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
                  <p className="text-2xl font-bold">{filteredAndSortedTasks.filter(task => task.status === 'EM_ESPERA').length}</p>
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
                  <p className="text-2xl font-bold">{filteredAndSortedTasks.filter(task => task.status === 'PARALISADA').length}</p>
                  <p className="text-xs text-muted-foreground">Paralisadas</p>
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
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Tarefa</TableHead>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead>Fase</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Início da Atividade</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Entrega Realizada</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedTasks.length > 0 ? (
                        filteredAndSortedTasks.map(renderTaskRow)
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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