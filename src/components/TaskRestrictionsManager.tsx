import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Task, TaskRestriction } from '@/types';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TaskRestrictionsManagerProps {
  task: Task;
  onRestrictionsUpdate?: () => void;
}

export function TaskRestrictionsManager({ task, onRestrictionsUpdate }: TaskRestrictionsManagerProps) {
  const [restrictions, setRestrictions] = useState<TaskRestriction[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [newRestriction, setNewRestriction] = useState({
    blocking_task_id: '',
    blocking_user_id: ''
  });
  const [loading, setLoading] = useState(false);

  const { tasks, profiles } = useSupabaseData();
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

  useEffect(() => {
    loadTaskRestrictions();
    loadAvailableTasks();
  }, [task.id, tasks, profiles]);

  // Atualizar quando tarefas ou perfis mudarem
  useEffect(() => {
    if (task?.id) {
      loadAvailableTasks();
    }
  }, [tasks]);

  const loadTaskRestrictions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_restrictions')
        .select(`
          *,
          waiting_task:tasks!waiting_task_id(title, status, assigned_to),
          blocking_task:tasks!blocking_task_id(title, status, assigned_to),
          blocking_user:profiles!blocking_user_id(full_name, email)
        `)
        .eq('waiting_task_id', task.id)
        .eq('status', 'active');

      if (error) throw error;

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
    } catch (error) {
      console.error('Erro ao carregar restrições:', error);
    }
  };

  const loadAvailableTasks = () => {
    // Filtrar tarefas do mesmo projeto, excluindo a tarefa atual
    // Inclui todas as tarefas não concluídas do projeto (admins podem ver todas)
    const isAdmin = profiles.find(p => p.id === user?.id)?.role === 'admin';

    const filtered = tasks.filter(t =>
      t.project_id === task.project_id &&
      t.id !== task.id &&
      t.status !== 'CONCLUIDA'
    );

    console.log('🔍 Tarefas disponíveis para restrição:', {
      projectId: task.project_id,
      totalTasks: tasks.length,
      filteredTasks: filtered.length,
      isAdmin,
      userId: user?.id
    });

    setAvailableTasks(filtered);
  };

  const addRestriction = async () => {
    if (!newRestriction.blocking_task_id) {
      return;
    }

    setLoading(true);
    try {
      // Encontrar a tarefa bloqueante para obter o usuário responsável
      const blockingTask = availableTasks.find(t => t.id === newRestriction.blocking_task_id);
      if (!blockingTask) {
        console.error('❌ Tarefa bloqueante não encontrada:', newRestriction.blocking_task_id);
        return;
      }

      // Se assigned_to é um array, pegar o primeiro usuário, senão usar o valor direto
      const blockingUserId = Array.isArray(blockingTask.assigned_to)
        ? blockingTask.assigned_to[0]
        : blockingTask.assigned_to;

      const restrictionData = {
        waiting_task_id: task.id,
        blocking_task_id: newRestriction.blocking_task_id,
        blocking_user_id: blockingUserId,
        status: 'active'
      };

      console.log('🔒 Adicionando restrição:', {
        waitingTask: task.title,
        blockingTask: blockingTask.title,
        blockingUser: blockingUserId,
        restrictionData
      });

      const { data, error } = await supabase
        .from('task_restrictions')
        .insert([restrictionData])
        .select();

      if (error) throw error;

      console.log('✅ Restrição adicionada com sucesso:', data);

      // Recarregar restrições
      await loadTaskRestrictions();

      setNewRestriction({
        blocking_task_id: '',
        blocking_user_id: ''
      });

      onRestrictionsUpdate?.();
    } catch (error) {
      console.error('❌ Erro ao adicionar restrição:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeRestriction = async (restrictionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('task_restrictions')
        .delete()
        .eq('id', restrictionId);

      if (error) throw error;

      // Recarregar restrições
      await loadTaskRestrictions();
      onRestrictionsUpdate?.();
    } catch (error) {
      console.error('Erro ao remover restrição:', error);
    } finally {
      setLoading(false);
    }
  };

  const canStartTask = restrictions.filter(r => r.status === 'active').length === 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Restrições da Tarefa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da tarefa */}
          <Alert className={canStartTask ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            <AlertDescription>
              {canStartTask ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Esta tarefa pode ser iniciada - sem restrições ativas</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>Esta tarefa está aguardando {restrictions.filter(r => r.status === 'active').length} dependência(s)</span>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Lista de restrições ativas */}
          {restrictions.filter(r => r.status === 'active').length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aguardando:</Label>
              {restrictions
                .filter(r => r.status === 'active')
                .map((restriction) => (
                  <Card key={restriction.id} className="border-orange-200">
                    <CardContent className="pt-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-orange-700 border-orange-300">
                              Bloqueada
                            </Badge>
                            <span className="text-sm font-medium">
                              {restriction.blocking_task_title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Responsável: <span className="font-medium">{restriction.blocking_user_name}</span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRestriction(restriction.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Adicionar nova restrição */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Adicionar Nova Restrição:</Label>

            <div className="space-y-3">
              <div>
                <Label htmlFor="blocking_task">Tarefa que está bloqueando</Label>
                <Select
                  value={newRestriction.blocking_task_id}
                  onValueChange={(value) =>
                    setNewRestriction(prev => ({ ...prev, blocking_task_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tarefa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((availableTask) => (
                      <SelectItem key={availableTask.id} value={availableTask.id}>
                        {availableTask.title} - {availableTask.phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={addRestriction}
                disabled={!newRestriction.blocking_task_id || loading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Restrição
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}