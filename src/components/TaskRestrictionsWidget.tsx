import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, FolderOpen, User } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { supabase } from '@/integrations/supabase/client';

interface TaskRestrictionDetail {
  id: string;
  waiting_task_id: string;
  blocking_task_id: string;
  blocking_user_id: string;
  status: 'active' | 'resolved' | 'cancelled';
  waiting_task_title?: string;
  blocking_task_title?: string;
  blocking_user_name?: string;
  waiting_project_name?: string;
  blocking_project_name?: string;
  created_at: string;
}

export function TaskRestrictionsWidget() {
  const { user } = useAuth();
  const { tasks, projects, profiles } = useSupabaseData();
  const [restrictions, setRestrictions] = useState<TaskRestrictionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadRestrictions();
    }
  }, [user?.id, tasks]);

  const loadRestrictions = async () => {
    try {
      setLoading(true);
      
      // Buscar restrições onde o usuário é responsável por tarefas que estão bloqueando outras
      const { data, error } = await supabase
        .from('task_restrictions')
        .select('*')
        .eq('blocking_user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;

      // Enriquecer dados com títulos de tarefas e projetos
      const enrichedRestrictions: TaskRestrictionDetail[] = await Promise.all(
        (data || []).map(async (restriction) => {
          const waitingTask = tasks.find(t => t.id === restriction.waiting_task_id);
          const blockingTask = tasks.find(t => t.id === restriction.blocking_task_id);
          const blockingUser = profiles.find(p => p.id === restriction.blocking_user_id);
          
          const waitingProject = waitingTask ? projects.find(p => p.id === waitingTask.project_id) : null;
          const blockingProject = blockingTask ? projects.find(p => p.id === blockingTask.project_id) : null;

          return {
            ...restriction,
            status: restriction.status as 'active' | 'resolved' | 'cancelled',
            waiting_task_title: waitingTask?.title || 'Tarefa não encontrada',
            blocking_task_title: blockingTask?.title || 'Tarefa não encontrada',
            blocking_user_name: blockingUser?.full_name || blockingUser?.email || 'Usuário não encontrado',
            waiting_project_name: waitingProject?.name || 'Projeto não encontrado',
            blocking_project_name: blockingProject?.name || 'Projeto não encontrado'
          };
        })
      );

      setRestrictions(enrichedRestrictions);
    } catch (error) {
      console.error('Erro ao carregar restrições:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysWaiting = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Carregando restrições...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (restrictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <CheckCircle className="h-4 w-4 mr-2 text-success" />
            Status das Restrições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">Excelente!</p>
            <p className="text-xs text-muted-foreground">
              Suas tarefas não estão bloqueando a equipe no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
          Suas Tarefas Bloqueando a Equipe ({restrictions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {restrictions.map((restriction) => {
          const daysWaiting = getDaysWaiting(restriction.created_at);
          
          return (
            <div key={restriction.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {restriction.blocking_project_name}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-destructive">
                    🚫 "{restriction.blocking_task_title}"
                  </p>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center space-x-1">
                      <span>Bloqueando:</span>
                      <span className="font-medium">"{restriction.waiting_task_title}"</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <FolderOpen className="h-3 w-3" />
                      <span>Projeto: {restriction.waiting_project_name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysWaiting} dia{daysWaiting !== 1 ? 's' : ''}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDate(restriction.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            💡 Conclua suas tarefas em vermelho para liberar a equipe!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}