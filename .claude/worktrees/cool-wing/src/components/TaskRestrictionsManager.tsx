import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, Plus, Clock, Ban, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Task } from '@/types';

interface TaskRestriction {
  id: string;
  waiting_task_id: string;
  blocking_task_id: string;
  blocking_user_id: string;
  status: string;
  blocking_task?: { title: string; status: string; assigned_to: string[] };
  waiting_task?: { title: string; status: string; assigned_to: string[] };
  blocking_user?: { full_name: string; email: string };
}

interface TaskRestrictionsManagerProps {
  task: Task;
  onRestrictionsUpdate?: () => void;
}

export function TaskRestrictionsManager({ task, onRestrictionsUpdate }: TaskRestrictionsManagerProps) {
  const { tasks, profiles } = useSupabaseData();
  const [waitingRestrictions, setWaitingRestrictions] = useState<TaskRestriction[]>([]);
  const [blockingRestrictions, setBlockingRestrictions] = useState<TaskRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para adicionar nova restrição de ESPERA
  const [newWaitingTaskId, setNewWaitingTaskId] = useState<string>('');
  const [newWaitingUserId, setNewWaitingUserId] = useState<string>('');
  
  // Estado para adicionar nova restrição de BLOQUEIO
  const [newBlockingTaskId, setNewBlockingTaskId] = useState<string>('');
  const [newBlockingUserId, setNewBlockingUserId] = useState<string>('');

  // Carregar restrições
  const loadRestrictions = async () => {
    if (!task?.id) return;

    try {
      setLoading(true);

      // Buscar tarefas que ESTA tarefa está ESPERANDO
      const { data: waitingData, error: waitingError } = await supabase
        .from('task_restrictions')
        .select(`
          *,
          blocking_task:tasks!blocking_task_id(title, status, assigned_to),
          blocking_user:profiles!blocking_user_id(full_name, email)
        `)
        .eq('waiting_task_id', task.id)
        .eq('status', 'active');

      if (waitingError) throw waitingError;

      // Buscar tarefas que ESTA tarefa está BLOQUEANDO
      const { data: blockingData, error: blockingError } = await supabase
        .from('task_restrictions')
        .select(`
          *,
          waiting_task:tasks!waiting_task_id(title, status, assigned_to)
        `)
        .eq('blocking_task_id', task.id)
        .eq('status', 'active');

      if (blockingError) throw blockingError;

      setWaitingRestrictions(waitingData || []);
      setBlockingRestrictions(blockingData || []);
    } catch (err) {
      console.error('Erro ao carregar restrições:', err);
      toast.error('Erro ao carregar restrições');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestrictions();
  }, [task?.id]);

  // Adicionar restrição de ESPERA (esta tarefa está esperando outra)
  const addWaitingRestriction = async () => {
    if (!newWaitingTaskId || !newWaitingUserId) {
      toast.error('Selecione uma tarefa e um responsável');
      return;
    }

    // Verificar se já existe esta restrição
    const exists = waitingRestrictions.some(
      r => r.blocking_task_id === newWaitingTaskId
    );

    if (exists) {
      toast.error('Esta restrição já existe');
      return;
    }

    try {
      const { error } = await supabase
        .from('task_restrictions')
        .insert({
          waiting_task_id: task.id,
          blocking_task_id: newWaitingTaskId,
          blocking_user_id: newWaitingUserId,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Restrição adicionada com sucesso');
      setNewWaitingTaskId('');
      setNewWaitingUserId('');
      loadRestrictions();
      onRestrictionsUpdate?.();
    } catch (err) {
      console.error('Erro ao adicionar restrição:', err);
      toast.error('Erro ao adicionar restrição');
    }
  };

  // Adicionar restrição de BLOQUEIO (esta tarefa está bloqueando outra)
  const addBlockingRestriction = async () => {
    if (!newBlockingTaskId || !newBlockingUserId) {
      toast.error('Selecione uma tarefa e um responsável');
      return;
    }

    // Verificar se já existe esta restrição
    const exists = blockingRestrictions.some(
      r => r.waiting_task_id === newBlockingTaskId
    );

    if (exists) {
      toast.error('Esta restrição já existe');
      return;
    }

    try {
      const { error } = await supabase
        .from('task_restrictions')
        .insert({
          waiting_task_id: newBlockingTaskId,
          blocking_task_id: task.id,
          blocking_user_id: newBlockingUserId,
          status: 'active'
        });

      if (error) throw error;

      toast.success('Restrição de bloqueio adicionada');
      setNewBlockingTaskId('');
      setNewBlockingUserId('');
      loadRestrictions();
      onRestrictionsUpdate?.();
    } catch (err) {
      console.error('Erro ao adicionar restrição de bloqueio:', err);
      toast.error('Erro ao adicionar restrição de bloqueio');
    }
  };

  // Remover restrição
  const removeRestriction = async (restrictionId: string) => {
    try {
      const { error } = await supabase
        .from('task_restrictions')
        .delete()
        .eq('id', restrictionId);

      if (error) throw error;

      toast.success('Restrição removida');
      loadRestrictions();
      onRestrictionsUpdate?.();
    } catch (err) {
      console.error('Erro ao remover restrição:', err);
      toast.error('Erro ao remover restrição');
    }
  };

  // Filtrar tarefas disponíveis (não arquivadas, não a tarefa atual, mesmo projeto)
  const availableTasks = tasks.filter(t => 
    !t.is_archived && 
    t.id !== task.id &&
    t.status !== 'CONCLUIDA' &&
    t.project_id === task.project_id
  );

  // Obter usuários responsáveis por uma tarefa
  const getTaskUsers = (taskId: string) => {
    const selectedTask = tasks.find(t => t.id === taskId);
    if (!selectedTask?.assigned_to) return [];
    
    return profiles.filter(p => selectedTask.assigned_to.includes(p.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const canStart = waitingRestrictions.length === 0;

  return (
    <div className="space-y-6">
      {/* Status da Tarefa */}
      <Alert variant={canStart ? "default" : "destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center gap-2">
          {canStart ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600 dark:text-green-400 font-medium">✅ Esta tarefa pode ser iniciada</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span className="font-medium">⏸️ Esta tarefa está bloqueada por {waitingRestrictions.length} tarefa(s)</span>
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Seção: Tarefas que estou ESPERANDO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Esta tarefa está ESPERANDO
          </CardTitle>
          <CardDescription>
            Tarefas que precisam ser concluídas antes desta poder iniciar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de restrições ativas */}
          {waitingRestrictions.length > 0 ? (
            <div className="space-y-2">
              {waitingRestrictions.map((restriction) => (
                <div
                  key={restriction.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{restriction.blocking_task?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Responsável: {restriction.blocking_user?.full_name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRestriction(restriction.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma restrição de espera</p>
          )}

          {/* Adicionar nova restrição de espera */}
          <div className="space-y-2 pt-4 border-t">
            <Select value={newWaitingTaskId} onValueChange={setNewWaitingTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a tarefa bloqueante" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {newWaitingTaskId && (
              <Select value={newWaitingUserId} onValueChange={setNewWaitingUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {getTaskUsers(newWaitingTaskId).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={addWaitingRestriction}
              disabled={!newWaitingTaskId || !newWaitingUserId}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar tarefa que estou esperando
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Tarefas que estou BLOQUEANDO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Esta tarefa está BLOQUEANDO
          </CardTitle>
          <CardDescription>
            Tarefas que estão aguardando a conclusão desta tarefa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de tarefas bloqueadas */}
          {blockingRestrictions.length > 0 ? (
            <div className="space-y-2">
              {blockingRestrictions.map((restriction) => (
                <div
                  key={restriction.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{restriction.waiting_task?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Aguardando esta tarefa ser concluída
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRestriction(restriction.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Esta tarefa não está bloqueando nenhuma outra</p>
          )}

          {/* Adicionar nova tarefa bloqueada */}
          <div className="space-y-2 pt-4 border-t">
            <Select value={newBlockingTaskId} onValueChange={setNewBlockingTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a tarefa que será bloqueada" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {newBlockingTaskId && (
              <Select value={newBlockingUserId} onValueChange={setNewBlockingUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável da tarefa bloqueada" />
                </SelectTrigger>
                <SelectContent>
                  {getTaskUsers(newBlockingTaskId).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={addBlockingRestriction}
              disabled={!newBlockingTaskId || !newBlockingUserId}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar tarefa que estou bloqueando
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {(waitingRestrictions.length > 0 || blockingRestrictions.length > 0) && (
        <Alert>
          <AlertDescription className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Esperando: {waitingRestrictions.length}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Ban className="h-3 w-3" />
              Bloqueando: {blockingRestrictions.length}
            </Badge>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
