import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Archive, ArchiveRestore, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Task } from '@/types';
import { TaskRestrictionsManager } from './TaskRestrictionsManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  mode: 'create' | 'edit' | 'view';
}

const TaskModal = ({ isOpen, onClose, task, mode }: TaskModalProps) => {
  const { projects, updateTask, createTask, profiles, refetchTasks } = useSupabaseData();
  const { user } = useAuth();
  const { toast } = useToast();

  // Lista de responsáveis usando dados reais do Supabase
  const teamMembers = profiles.map(profile => ({
    id: profile.id,
    name: profile.full_name || profile.email
  }));

  // Lista de disciplinas para dependências
  const disciplines = [
    'ARQUITETURA',
    'METALICA',
    'CONCRETO',
    'ELETRICA',
    'HIDROSSANITARIO',
    'SPDA',
    'CLIMATIZACAO',
    'INCENDIO',
    'INFRAESTRUTURA',
    'MODELAGEM',
    'CONSTRUÇÃO VIRTUAL',
    'ORÇAMENTO'
  ];

  // Função para converter data do formato ISO para input date
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';

    // Se a data já está no formato YYYY-MM-DD, retorna diretamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Para datas ISO completas, extrair apenas a parte da data
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    // Para outros formatos, usar Date mas ajustar o timezone
    const date = new Date(dateString + 'T12:00:00'); // Adiciona meio-dia para evitar problemas de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para garantir que a data seja salva no formato correto
  const formatDateForSave = (dateString: string) => {
    if (!dateString) return undefined;

    // Se já está no formato YYYY-MM-DD, retorna diretamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Para qualquer outro formato, usar Date e extrair apenas a data
    const date = new Date(dateString + 'T12:00:00'); // Adiciona meio-dia para evitar problemas de timezone
    if (isNaN(date.getTime())) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calcular prioridade baseada no prazo (dias até o vencimento)
  const calculatePriority = (dueDate: string): Task['priority'] => {
    if (!dueDate) return 'media';

    const today = new Date();
    const due = new Date(dueDate + 'T12:00:00'); // Adiciona meio-dia para evitar problemas de timezone
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return 'alta'; // 7 dias ou menos = ALTA
    } else if (diffDays <= 15) {
      return 'media'; // 8-15 dias = MÉDIA
    } else {
      return 'baixa'; // Mais de 15 dias = BAIXA
    }
  };


  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    assigned_to: '' as string | string[],
    status: 'PENDENTE' as Task['status'],
    phase: 'EXECUTIVO' as Task['phase'],
    priority: 'media' as Task['priority'],
    activity_start: '',
    due_date: '',
    last_delivery: '',
    comment: '',
    dependencies: [] as string[],
    completed_at: undefined as string | undefined
  });

  const [hasActiveRestrictions, setHasActiveRestrictions] = useState(false);
  const [restrictionsCount, setRestrictionsCount] = useState(0);

  // Função para verificar restrições ativas
  const checkActiveRestrictions = async () => {
    if (!task?.id) return;

    try {
      const { data, error } = await supabase
        .from('task_restrictions')
        .select('id')
        .eq('waiting_task_id', task.id)
        .eq('status', 'active');

      if (error) throw error;

      const activeCount = data?.length || 0;
      setHasActiveRestrictions(activeCount > 0);
      setRestrictionsCount(activeCount);
    } catch (error) {
      console.error('Erro ao verificar restrições:', error);
    }
  };

  // Verificar restrições quando o modal abrir
  useEffect(() => {
    if (task && isOpen) {
      checkActiveRestrictions();
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (task && (mode === 'edit' || mode === 'view')) {
      setFormData({
        project_id: task.project_id,
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to,
        status: task.status,
        phase: task.phase,
        priority: task.priority,
        activity_start: formatDateForInput(task.activity_start || ''),
        due_date: formatDateForInput(task.due_date || ''),
        last_delivery: formatDateForInput(task.last_delivery || ''),
        comment: task.comment || '',
        dependencies: task.dependencies || [],
        completed_at: task.completed_at
      });
    } else if (mode === 'create') {
      setFormData({
        project_id: '',
        title: '',
        description: '',
        assigned_to: user?.id || '' as string | string[],
        status: 'PENDENTE',
        phase: 'EXECUTIVO',
        priority: 'media',
        activity_start: '',
        due_date: '',
        last_delivery: '',
        comment: '',
        dependencies: [],
        completed_at: undefined
      });
    }
  }, [task, mode, user]);

  // Recalcular prioridade quando due_date mudar
  useEffect(() => {
    if (formData.due_date) {
      const newPriority = calculatePriority(formData.due_date);
      setFormData(prev => ({ ...prev, priority: newPriority }));
    }
  }, [formData.due_date]);

  // Auto-conclusão: quando marcar entrega realizada, mudar status para CONCLUIDA
  const [autoCompletedMessage, setAutoCompletedMessage] = useState(false);
  
  useEffect(() => {
    if (formData.last_delivery && formData.status !== 'CONCLUIDA') {
      setFormData(prev => ({ 
        ...prev, 
        status: 'CONCLUIDA',
        completed_at: formData.last_delivery + 'T18:00:00.000Z'
      }));
      setAutoCompletedMessage(true);
      
      // Remover mensagem após 3 segundos
      setTimeout(() => setAutoCompletedMessage(false), 3000);
    }
  }, [formData.last_delivery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.project_id) {
      toast({
        title: "Erro de validação",
        description: "Selecione um projeto para a tarefa.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.due_date) {
      toast({
        title: "Erro de validação",
        description: "O prazo da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.assigned_to || (Array.isArray(formData.assigned_to) && formData.assigned_to.length === 0)) {
      toast({
        title: "Erro de validação",
        description: "Atribua pelo menos um responsável à tarefa.",
        variant: "destructive",
      });
      return;
    }

    const taskData = {
      ...formData,
      activity_start: formatDateForSave(formData.activity_start),
      due_date: formatDateForSave(formData.due_date),
      last_delivery: formatDateForSave(formData.last_delivery),
      comment: formData.comment || undefined,
      dependencies: formData.dependencies.length > 0 ? formData.dependencies : undefined
    };

    const finalTaskData = {
      ...taskData,
      completed_at: (taskData.status === 'CONCLUIDA' && taskData.last_delivery)
        ? (taskData.last_delivery + 'T18:00:00.000Z')
        : undefined,
      assigned_to: taskData.assigned_to || []
    };

    try {
      if (mode === 'create') {
        await createTask(finalTaskData);
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso!",
        });
      } else if (mode === 'edit' && task) {
        await updateTask(task.id, finalTaskData);
        await refetchTasks(); // Forçar atualização dos dados
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso!",
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveToggle = async () => {
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_archived: !task.is_archived,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      // Recarregar dados
      await refetchTasks();
      toast({
        title: "Sucesso",
        description: task.is_archived ? "Tarefa desarquivada com sucesso!" : "Tarefa arquivada com sucesso!",
      });
      onClose();
    } catch (error) {
      console.error('Erro ao arquivar/desarquivar tarefa:', error);
    }
  };

  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  // Verificar se o usuário está entre os responsáveis da tarefa
  const isAssignedToTask = task ? (
    Array.isArray(task.assigned_to) 
      ? task.assigned_to.includes(user?.id || '') 
      : task.assigned_to === user?.id
  ) : false;

  // Usuários e admins podem editar todos os campos das tarefas
  const canEditField = (fieldName: string) => {
    if (mode === 'view') return false;
    return true; // Todos podem editar todos os campos
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Tarefa';
      case 'edit': return 'Editar Tarefa';
      case 'view': return 'Visualizar Tarefa';
      default: return 'Tarefa';
    }
  };

  const isTaskReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Preencha as informações para criar uma nova tarefa.'}
            {mode === 'edit' && 'Edite as informações da tarefa.'}
            {mode === 'view' && 'Visualize as informações da tarefa.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Projeto */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="project_id">Projeto</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                disabled={isTaskReadOnly || !canEditField('project_id')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2 col-span-full">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Projeto Elétrico"
                required
                readOnly={isTaskReadOnly || !canEditField('title')}
              />
            </div>

            {/* Responsáveis */}
            <div className="space-y-2 col-span-full">
              <Label>Responsáveis</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assigned-${member.id}`}
                      checked={Array.isArray(formData.assigned_to) ?
                        formData.assigned_to.includes(member.id) :
                        formData.assigned_to === member.id
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (Array.isArray(formData.assigned_to)) {
                            setFormData(prev => ({
                              ...prev,
                              assigned_to: [...prev.assigned_to as string[], member.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              assigned_to: formData.assigned_to ? [formData.assigned_to as string, member.id] : [member.id]
                            }));
                          }
                        } else {
                          if (Array.isArray(formData.assigned_to)) {
                            const newAssigned = formData.assigned_to.filter(id => id !== member.id);
                            setFormData(prev => ({
                              ...prev,
                              assigned_to: newAssigned.length === 1 ? newAssigned[0] : newAssigned
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              assigned_to: ''
                            }));
                          }
                        }
                      }}
                      disabled={isTaskReadOnly || !canEditField('assigned_to')}
                    />
                    <Label
                      htmlFor={`assigned-${member.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task['status']) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={!canEditField('status')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="PARALISADA">Paralisada</SelectItem>
                  <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fase */}
            <div className="space-y-2">
              <Label htmlFor="phase">Fase</Label>
              <Select
                value={formData.phase}
                onValueChange={(value: Task['phase']) => setFormData(prev => ({ ...prev, phase: value }))}
                disabled={!canEditField('phase')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDO_PRELIMINAR">Estudo Preliminar</SelectItem>
                  <SelectItem value="PROJETO_BASICO">Projeto Básico</SelectItem>
                  <SelectItem value="EXECUTIVO">Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                disabled={true}
              >
                <SelectTrigger className="bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Calculada automaticamente: ≤7 dias = Alta, 8-15 dias = Média, +15 dias = Baixa
              </p>
            </div>


            {/* Início da Atividade */}
            <div className="space-y-2">
              <Label htmlFor="activity_start">Início da Atividade</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="activity_start"
                  type="date"
                  value={formData.activity_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, activity_start: e.target.value }))}
                  readOnly={!canEditField('activity_start')}
                />
                {!formData.activity_start && task && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!hasActiveRestrictions) {
                        const today = new Date().toISOString().split('T')[0];
                        setFormData(prev => ({ ...prev, activity_start: today }));
                      }
                    }}
                    disabled={hasActiveRestrictions}
                    title={hasActiveRestrictions
                      ? `Esta tarefa possui ${restrictionsCount} restrição(ões) ativa(s). Consulte a seção 'Restrições da Tarefa'`
                      : "Marcar início hoje"
                    }
                  >
                    {hasActiveRestrictions ? '🔒 Bloqueada' : '▶️ Iniciar Hoje'}
                  </Button>
                )}
              </div>
              {hasActiveRestrictions && (
                <p className="text-xs text-orange-600">
                  ⚠️ Esta tarefa possui {restrictionsCount} dependência(s) ativa(s). Verifique a seção "Restrições da Tarefa" abaixo.
                </p>
              )}
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Prazo</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
                readOnly={!canEditField('due_date')}
              />
            </div>

            {/* Entrega Realizada */}
            <div className="space-y-2">
              <Label htmlFor="last_delivery">Entrega Realizada</Label>
              <Input
                id="last_delivery"
                type="date"
                value={formData.last_delivery}
                onChange={(e) => setFormData(prev => ({ ...prev, last_delivery: e.target.value }))}
                readOnly={!canEditField('last_delivery')}
              />
              {autoCompletedMessage && (
                <p className="text-xs text-success font-medium flex items-center gap-1">
                  ✅ Status automaticamente alterado para CONCLUÍDA
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a tarefa..."
              rows={3}
              readOnly={!canEditField('description')}
            />
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Adicione comentários sobre a atividade..."
              rows={3}
              readOnly={!canEditField('comment')}
            />
          </div>

          {/* Sistema de Restrições - Apenas para tarefas existentes */}
          {task && (mode === 'edit' || mode === 'view') && (
            <div className="space-y-2 pt-4 border-t">
              <TaskRestrictionsManager
                task={task}
                onRestrictionsUpdate={() => {
                  // Recarregar verificação de restrições
                  checkActiveRestrictions();
                }}
              />
            </div>
          )}

            <DialogFooter className="justify-between">
              <div className="flex gap-2">
                {task && mode !== 'create' && (isAdmin || isAssignedToTask) && (
                  <Button
                    type="button"
                    variant={task.is_archived ? "default" : "outline"}
                    onClick={handleArchiveToggle}
                    className="flex items-center gap-2"
                  >
                    {task.is_archived ? (
                      <>
                        <ArchiveRestore className="h-4 w-4" />
                        Desarquivar
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4" />
                        Arquivar
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {mode === 'view' ? 'Fechar' : 'Cancelar'}
                </Button>
                {!isTaskReadOnly && (
                  <Button type="submit">
                    {mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações'}
                  </Button>
                )}
              </div>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;