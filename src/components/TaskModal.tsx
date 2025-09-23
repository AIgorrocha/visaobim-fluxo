import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  mode: 'create' | 'edit';
}

const TaskModal = ({ isOpen, onClose, task, mode }: TaskModalProps) => {
  const { projects, updateTask, createTask } = useAppData();
  const { user } = useAuth();

  // Lista de responsáveis
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
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Calcular prioridade baseada no prazo (dias até o vencimento)
  const calculatePriority = (dueDate: string): Task['priority'] => {
    if (!dueDate) return 'media';

    const today = new Date();
    const due = new Date(dueDate);
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

  // Calcular pontuação baseada na entrega vs prazo
  const calculatePoints = (dueDate: string, deliveryDate?: string) => {
    if (!deliveryDate || !dueDate) {
      return 0; // Sem pontuação para tarefas não entregues
    }

    const due = new Date(dueDate);
    const delivery = new Date(deliveryDate);

    // Calcular diferença em dias (prazo - entrega)
    const diffTime = due.getTime() - delivery.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let points = 0; // Sem pontuação base

    if (diffDays > 0) {
      // Entregue ANTES do prazo: +2 pontos por dia antecipado
      points = diffDays * 2;
    } else if (diffDays < 0) {
      // Entregue DEPOIS do prazo: -4 pontos por dia de atraso
      points = diffDays * 4; // diffDays já é negativo
    }
    // Se entregue exatamente no prazo (diffDays === 0), fica com 0 pontos

    return Math.max(0, points); // Não permitir pontuação negativa
  };

  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    assigned_to: '' as string | string[],
    status: 'PENDENTE' as Task['status'],
    phase: 'EXECUTIVO' as Task['phase'],
    priority: 'media' as Task['priority'],
    points: 0,
    activity_start: '',
    due_date: '',
    last_delivery: '',
    comment: '',
    restricoes: '',
    dependencies: [] as string[],
    completed_at: undefined as string | undefined
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        project_id: task.project_id,
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to,
        status: task.status,
        phase: task.phase,
        priority: task.priority,
        points: task.points,
        activity_start: formatDateForInput(task.activity_start || ''),
        due_date: formatDateForInput(task.due_date || ''),
        last_delivery: formatDateForInput(task.last_delivery || ''),
        comment: task.comment || '',
        restricoes: task.restricoes || '',
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
        points: 0,
        activity_start: '',
        due_date: '',
        last_delivery: '',
        comment: '',
        restricoes: '',
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

  // Recalcular pontuação quando delivery date mudar
  useEffect(() => {
    if (formData.due_date) {
      const newPoints = calculatePoints(formData.due_date, formData.last_delivery);
      setFormData(prev => ({ ...prev, points: newPoints }));
    }
  }, [formData.due_date, formData.last_delivery]);

  // Automaticamente marcar como concluída quando data de entrega é preenchida
  useEffect(() => {
    if (formData.last_delivery && formData.status !== 'PARALISADA') {
      setFormData(prev => ({
        ...prev,
        status: 'CONCLUIDA',
        completed_at: formData.last_delivery + 'T18:00:00Z'
      }));
    } else if (!formData.last_delivery && formData.status === 'CONCLUIDA') {
      // Se remover a data de entrega e estava concluída, volta para pendente
      setFormData(prev => ({
        ...prev,
        status: 'PENDENTE',
        completed_at: undefined
      }));
    }
  }, [formData.last_delivery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      activity_start: formData.activity_start,
      due_date: formData.due_date,
      last_delivery: formData.last_delivery || undefined,
      comment: formData.comment || undefined,
      dependencies: formData.dependencies.length > 0 ? formData.dependencies : undefined,
      completed_at: formData.completed_at
    };

    if (mode === 'create') {
      createTask(taskData);
    } else if (mode === 'edit' && task) {
      updateTask(task.id, taskData);
    }

    onClose();
  };

  const isAdmin = user?.role === 'admin';
  const isOwnTask = task?.assigned_to === user?.id;

  // Usuários só podem editar entrega realizada e comentário de suas próprias tarefas
  const canEditField = (fieldName: string) => {
    if (isAdmin) return true;
    if (isOwnTask && (fieldName === 'last_delivery' || fieldName === 'comment')) return true;
    return false;
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Tarefa';
      case 'edit': return 'Editar Tarefa';
      default: return 'Tarefa';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Preencha as informações para criar uma nova tarefa.'}
            {mode === 'edit' && isAdmin && 'Edite as informações da tarefa.'}
            {mode === 'edit' && !isAdmin && 'Você pode editar apenas a entrega realizada e comentários.'}
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
                disabled={!canEditField('project_id')}
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
                readOnly={!canEditField('title')}
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
                      disabled={!canEditField('assigned_to')}
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

            {/* Pontuação */}
            <div className="space-y-2">
              <Label htmlFor="points">Pontuação</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Calculada automaticamente: +2 pontos por dia antecipado ou -4 pontos por dia atrasado
              </p>
            </div>

            {/* Início da Atividade */}
            <div className="space-y-2">
              <Label htmlFor="activity_start">Início da Atividade</Label>
              <Input
                id="activity_start"
                type="date"
                value={formData.activity_start}
                onChange={(e) => setFormData(prev => ({ ...prev, activity_start: e.target.value }))}
                readOnly={!canEditField('activity_start')}
              />
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

            {/* Entrega Realizada - USUÁRIOS PODEM EDITAR */}
            <div className="space-y-2">
              <Label htmlFor="last_delivery">Entrega Realizada</Label>
              <Input
                id="last_delivery"
                type="date"
                value={formData.last_delivery}
                onChange={(e) => setFormData(prev => ({ ...prev, last_delivery: e.target.value }))}
                readOnly={!canEditField('last_delivery')}
                className={canEditField('last_delivery') ? 'border-green-300 bg-green-50' : ''}
              />
              {canEditField('last_delivery') && (
                <p className="text-xs text-green-600">✓ Você pode editar este campo</p>
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

          {/* Restrições */}
          <div className="space-y-2">
            <Label htmlFor="restricoes">Restrições</Label>
            <Textarea
              id="restricoes"
              value={formData.restricoes}
              onChange={(e) => setFormData(prev => ({ ...prev, restricoes: e.target.value }))}
              placeholder="Ex: ARQUITETURA, ESTRUTURA, CONSTRUÇÃO VIRTUAL..."
              rows={2}
              readOnly={!canEditField('restricoes')}
            />
            <p className="text-xs text-muted-foreground">
              Informe as dependências necessárias para iniciar a tarefa
            </p>
          </div>


          {/* Comentário - USUÁRIOS PODEM EDITAR */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Adicione comentários sobre a atividade..."
              rows={3}
              readOnly={!canEditField('comment')}
              className={canEditField('comment') ? 'border-green-300 bg-green-50' : ''}
            />
            {canEditField('comment') && (
              <p className="text-xs text-green-600">✓ Você pode editar este campo</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;