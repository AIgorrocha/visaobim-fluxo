import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

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

const RelatorioTarefas = () => {
  const { user, profile } = useAuth();
  const { tasks, projects, profiles } = useSupabaseData();
  const [restrictions, setRestrictions] = useState<TaskRestrictionDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRestrictions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_restrictions_detailed')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestrictions(data || []);
    } catch (error) {
      console.error('Erro ao carregar restrições:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar restrições em tempo real
  useRealtimeSync(loadRestrictions);

  useEffect(() => {
    loadRestrictions();
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getDaysWaiting = (createdAt: string) => {
    return differenceInDays(new Date(), new Date(createdAt));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDA': return 'bg-green-100 text-green-800';
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'PARALISADA': return 'bg-red-100 text-red-800';
      case 'EM_ESPERA': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-primary to-primary/70">
            Relatório de Tarefas
          </h1>
          <p className="text-muted-foreground mt-2">
            Relatórios, cronograma e bloqueios de tarefas
          </p>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => !t.is_archived).length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'CONCLUIDA' && !t.is_archived).length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter(p => !p.is_archived).length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.filter(p => p.status === 'EM_ANDAMENTO' && !p.is_archived).length} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueios Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restrictions.length}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas aguardando dependências
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros da Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de colaboradores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Bloqueios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Tarefas Bloqueadas ({restrictions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando bloqueios...</p>
            </div>
          ) : restrictions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-medium text-green-700 mb-2">Nenhuma tarefa bloqueada!</h3>
              <p className="text-muted-foreground">
                Todas as tarefas podem ser iniciadas sem dependências.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {restrictions.map((restriction) => (
                <div 
                  key={restriction.id} 
                  className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="text-xs">
                          BLOQUEADA
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Aguardando há {getDaysWaiting(restriction.created_at)} dia(s)
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            🚫 {restriction.waiting_task_title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(restriction.waiting_task_status)}>
                              {restriction.waiting_task_status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {projects.find(p => p.id === tasks.find(t => t.id === restriction.waiting_task_id)?.project_id)?.name || 'Projeto não encontrado'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pl-4 border-l-2 border-amber-300">
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Está bloqueada por:</strong>
                          </p>
                          <p className="font-medium text-amber-800">
                            ⏳ {restriction.blocking_task_title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(restriction.blocking_task_status)}>
                              {restriction.blocking_task_status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {projects.find(p => p.id === tasks.find(t => t.id === restriction.blocking_task_id)?.project_id)?.name || 'Projeto não encontrado'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Responsável: <strong>{restriction.blocking_user_name}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="text-xs text-muted-foreground">
                    Bloqueio criado em {formatDate(restriction.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatório de Cronograma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Cronograma das Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks
              .filter(t => !t.is_archived && (t.activity_start || t.due_date))
              .sort((a, b) => {
                const dateA = new Date(a.activity_start || a.due_date || '');
                const dateB = new Date(b.activity_start || b.due_date || '');
                return dateA.getTime() - dateB.getTime();
              })
              .slice(0, 10)
              .map((task) => {
                const project = projects.find(p => p.id === task.project_id);
                return (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {project?.name} - {project?.client}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {task.activity_start && (
                        <div>Início: {format(new Date(task.activity_start), 'dd/MM', { locale: ptBR })}</div>
                      )}
                      {task.due_date && (
                        <div>Prazo: {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}</div>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioTarefas;