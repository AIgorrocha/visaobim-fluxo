import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskRestrictionDetail {
  id: string;
  waiting_task_id: string;
  blocking_task_id: string;
  blocking_user_id: string;
  status: string;
  created_at: string;
  waiting_task_title: string;
  waiting_task_status: string;
  blocking_task_title: string;
  blocking_task_status: string;
  blocking_user_name: string;
  blocking_user_email: string;
}

const TaskActivitiesWidget = () => {
  const { user } = useAuth();
  const { tasks, projects } = useSupabaseData();
  const [myBlockingTasks, setMyBlockingTasks] = useState<TaskRestrictionDetail[]>([]);
  const [myBlockedTasks, setMyBlockedTasks] = useState<TaskRestrictionDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTaskActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_restrictions_detailed')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allRestrictions = data || [];

      // Separar as tarefas que estou bloqueando vs as que estão me bloqueando
      const blocking = allRestrictions.filter(r => r.blocking_user_id === user.id);
      const blocked = allRestrictions.filter(r => {
        const waitingTask = tasks.find(t => t.id === r.waiting_task_id);
        return waitingTask && Array.isArray(waitingTask.assigned_to) 
          ? waitingTask.assigned_to.includes(user.id)
          : waitingTask?.assigned_to === user.id;
      });

      setMyBlockingTasks(blocking);
      setMyBlockedTasks(blocked);
    } catch (error) {
      console.error('Erro ao carregar atividades de tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskActivities();
  }, [user, tasks]);

  // Recarregar quando houver mudanças nas tarefas ou restrições
  useEffect(() => {
    const interval = setInterval(loadTaskActivities, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getDaysWaiting = (createdAt: string) => {
    return differenceInDays(new Date(), new Date(createdAt));
  };

  const getProjectName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return 'Projeto não encontrado';
    
    const project = projects.find(p => p.id === task.project_id);
    return project ? `${project.name} / ${project.client}` : 'Projeto não encontrado';
  };

  const getTaskDates = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { start: null, end: null };
    
    return {
      start: task.activity_start ? formatDate(task.activity_start) : null,
      end: task.due_date ? formatDate(task.due_date) : null
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tarefas que estou bloqueando */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Minhas tarefas bloqueando a equipe ({myBlockingTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myBlockingTasks.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Você não está bloqueando nenhuma tarefa da equipe! 👏
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBlockingTasks.map((restriction) => {
                const blockingDates = getTaskDates(restriction.blocking_task_id);
                const waitingDates = getTaskDates(restriction.waiting_task_id);
                
                return (
                  <div key={restriction.id} className="text-sm p-3 bg-amber-50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-amber-800">
                          {restriction.blocking_task_title}
                        </span>
                        <span className="text-muted-foreground"> - </span>
                        <span className="text-muted-foreground">
                          {getProjectName(restriction.blocking_task_id)}
                        </span>
                        {blockingDates.start && blockingDates.end && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({blockingDates.start} - {blockingDates.end})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>está bloqueando</span>
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">
                          {restriction.waiting_task_title}
                        </span>
                        <span className="text-muted-foreground"> - </span>
                        <span className="text-muted-foreground">
                          {getProjectName(restriction.waiting_task_id)}
                        </span>
                        {waitingDates.start && waitingDates.end && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({waitingDates.start} - {waitingDates.end})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          Bloqueada há {getDaysWaiting(restriction.created_at)} dia(s)
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarefas minhas bloqueadas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-orange-500" />
            Minhas tarefas bloqueadas por outros ({myBlockedTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myBlockedTasks.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Suas tarefas podem ser iniciadas sem dependências! 🚀
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBlockedTasks.map((restriction) => {
                const waitingDates = getTaskDates(restriction.waiting_task_id);
                const blockingDates = getTaskDates(restriction.blocking_task_id);
                
                return (
                  <div key={restriction.id} className="text-sm p-3 bg-orange-50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-orange-800">
                          {restriction.waiting_task_title}
                        </span>
                        <span className="text-muted-foreground"> - </span>
                        <span className="text-muted-foreground">
                          {getProjectName(restriction.waiting_task_id)}
                        </span>
                        {waitingDates.start && waitingDates.end && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({waitingDates.start} - {waitingDates.end})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>está aguardando</span>
                        <Clock className="h-3 w-3" />
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">
                          {restriction.blocking_task_title}
                        </span>
                        <span className="text-muted-foreground"> - </span>
                        <span className="text-muted-foreground">
                          {getProjectName(restriction.blocking_task_id)}
                        </span>
                        {blockingDates.start && blockingDates.end && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({blockingDates.start} - {blockingDates.end})
                          </span>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Responsável: <strong>{restriction.blocking_user_name}</strong>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          Aguardando há {getDaysWaiting(restriction.created_at)} dia(s)
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskActivitiesWidget;