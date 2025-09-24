import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface TaskRestriction {
  id: string;
  waiting_task_id: string;
  waiting_task_title: string;
  waiting_task_assigned_to: string[];
  blocking_task_id: string;
  blocking_task_title: string;
  blocking_user_name: string;
  status: string;
}

export const RestrictionsWidget = () => {
  const { user } = useAuth();
  const [blockingTasks, setBlockingTasks] = useState<TaskRestriction[]>([]);
  const [waitingTasks, setWaitingTasks] = useState<TaskRestriction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadRestrictions();
  }, [user]);

  const loadRestrictions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Tarefas que o usuário está bloqueando (outros aguardando)
      const { data: blockingData, error: blockingError } = await supabase
        .from('task_restrictions_detailed')
        .select('*')
        .eq('blocking_user_id', user.id)
        .eq('status', 'active');

      if (blockingError) throw blockingError;

      // Tarefas que estão esperando o usuário (o usuário sendo bloqueado)
      const { data: waitingData, error: waitingError } = await supabase
        .from('task_restrictions_detailed')
        .select('*')
        .contains('waiting_task_assigned_to', [user.id])
        .eq('status', 'active');

      if (waitingError) throw waitingError;

      setBlockingTasks(blockingData || []);
      setWaitingTasks(waitingData || []);
    } catch (error) {
      console.error('Erro ao carregar restrições:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveRestriction = async (restrictionId: string) => {
    try {
      const { error } = await supabase
        .from('task_restrictions')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', restrictionId);

      if (error) throw error;

      // Recarregar as restrições
      await loadRestrictions();
    } catch (error) {
      console.error('Erro ao resolver restrição:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Clock className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Carregando restrições...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBlocking = blockingTasks.length;
  const totalWaiting = waitingTasks.length;

  return (
    <div className="space-y-4">
      {/* Resumo das restrições */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={totalBlocking > 0 ? 'border-destructive/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`h-5 w-5 ${totalBlocking > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-2xl font-bold">{totalBlocking}</p>
                  <p className="text-xs text-muted-foreground">Bloqueando outros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={totalWaiting > 0 ? 'border-warning/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className={`h-5 w-5 ${totalWaiting > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-2xl font-bold">{totalWaiting}</p>
                  <p className="text-xs text-muted-foreground">Esperando outros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tarefas que estão bloqueando outros */}
      {blockingTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Suas Tarefas Bloqueando a Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockingTasks.map((restriction) => (
                  <div
                    key={restriction.id}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{restriction.blocking_task_title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Está impedindo: <span className="font-medium">{restriction.waiting_task_title}</span>
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant="destructive" className="text-xs">
                          URGENTE - Equipe aguardando
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveRestriction(restriction.id)}
                      className="ml-3"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tarefas esperando outros */}
      {waitingTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center text-warning">
                <Clock className="h-5 w-5 mr-2" />
                Suas Tarefas em Espera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waitingTasks.map((restriction) => (
                  <div
                    key={restriction.id}
                    className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{restriction.waiting_task_title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Aguardando: <span className="font-medium">{restriction.blocking_task_title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Responsável: <span className="font-medium">{restriction.blocking_user_name}</span>
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-xs">
                          EM ESPERA
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Estado vazio */}
      {blockingTasks.length === 0 && waitingTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <h3 className="text-lg font-medium text-success mb-2">
                  Excelente! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Não há restrições ativas. Sua equipe está fluindo perfeitamente!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};