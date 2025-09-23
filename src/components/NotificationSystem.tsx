import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'task_available' | 'blocking_others' | 'deadline_critical' | 'dependency_completed';
  title: string;
  message: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  task_id?: string;
  user_id?: string;
  created_at: Date;
}

export const NotificationSystem = () => {
  const { user } = useAuth();
  const { tasks, profiles, projects } = useSupabaseData();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Gerar notificações baseadas no estado atual das tarefas
  useEffect(() => {
    if (!user || !tasks.length) return;

    const newNotifications: Notification[] = [];
    const userTasks = tasks.filter(task => 
      Array.isArray(task.assigned_to) 
        ? task.assigned_to.includes(user.id)
        : task.assigned_to === user.id
    );

    // 1. Tarefas liberadas para o usuário (sem dependências bloqueadas)
    const availableTasks = userTasks.filter(task => {
      if (task.status !== 'PENDENTE') return false;
      
      // Verificar se tem restrições
      if (!task.restricoes) return true;
      
      try {
        const restrictions = typeof task.restricoes === 'string' 
          ? JSON.parse(task.restricoes)
          : task.restricoes;
        
        if (!Array.isArray(restrictions) || restrictions.length === 0) return true;
        
        // Verificar se todas as dependências foram resolvidas
        const blockedByUsers = restrictions.filter(userId => {
          const userTasks = tasks.filter(t => 
            Array.isArray(t.assigned_to) 
              ? t.assigned_to.includes(userId)
              : t.assigned_to === userId
          );
          
          // Se o usuário tem tarefas pendentes ou em andamento no mesmo projeto, ainda está bloqueando
          return userTasks.some(t => 
            t.project_id === task.project_id && 
            (t.status === 'PENDENTE' || t.status === 'EM_ANDAMENTO')
          );
        });
        
        return blockedByUsers.length === 0;
      } catch {
        return true;
      }
    });

    availableTasks.forEach(task => {
      const daysUntilDeadline = Math.ceil(
        (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      newNotifications.push({
        id: `available_${task.id}`,
        type: 'task_available',
        title: '✅ Tarefa Liberada',
        message: `"${task.title}" está liberada para iniciar`,
        urgency: daysUntilDeadline <= 3 ? 'high' : 'medium',
        task_id: task.id,
        user_id: user.id,
        created_at: new Date()
      });
    });

    // 2. Usuário está bloqueando outros projetistas
    const blockingTasks = userTasks.filter(task => 
      task.status === 'PENDENTE' || task.status === 'EM_ANDAMENTO'
    );

    blockingTasks.forEach(task => {
      // Contar quantas tarefas dependem desta
      const dependentTasks = tasks.filter(t => {
        if (!t.restricoes) return false;
        try {
          const restrictions = typeof t.restricoes === 'string' 
            ? JSON.parse(t.restricoes)
            : t.restricoes;
          return Array.isArray(restrictions) && restrictions.includes(user.id);
        } catch {
          return false;
        }
      });

      if (dependentTasks.length > 0) {
        const affectedUsers = dependentTasks.flatMap(t => 
          Array.isArray(t.assigned_to) ? t.assigned_to : [t.assigned_to]
        ).filter(id => id !== user.id);

        const uniqueAffectedUsers = [...new Set(affectedUsers)];
        
        newNotifications.push({
          id: `blocking_${task.id}`,
          type: 'blocking_others',
          title: '⚠️ Você está segurando a equipe',
          message: `"${task.title}" está bloqueando ${uniqueAffectedUsers.length} pessoa(s)`,
          urgency: 'critical',
          task_id: task.id,
          user_id: user.id,
          created_at: new Date()
        });
      }
    });

    // 3. Prazos críticos (tarefas que vencem em breve e afetam outros)
    const criticalDeadlines = userTasks.filter(task => {
      const daysUntilDeadline = Math.ceil(
        (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Tarefas com prazo em 2 dias ou menos
      if (daysUntilDeadline > 2) return false;
      
      // Que estão bloqueando outras tarefas
      const dependentTasks = tasks.filter(t => {
        if (!t.restricoes) return false;
        try {
          const restrictions = typeof t.restricoes === 'string' 
            ? JSON.parse(t.restricoes)
            : t.restricoes;
          return Array.isArray(restrictions) && restrictions.includes(user.id);
        } catch {
          return false;
        }
      });
      
      return dependentTasks.length > 0;
    });

    criticalDeadlines.forEach(task => {
      newNotifications.push({
        id: `critical_${task.id}`,
        type: 'deadline_critical',
        title: '🚨 Prazo Crítico',
        message: `"${task.title}" vence em breve e afeta outros projetistas`,
        urgency: 'critical',
        task_id: task.id,
        user_id: user.id,
        created_at: new Date()
      });
    });

    setNotifications(newNotifications);
  }, [tasks, user]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const criticalCount = notifications.filter(n => n.urgency === 'critical').length;
  const totalCount = notifications.length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {totalCount > 0 && (
          <Badge 
            className={`absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center ${
              criticalCount > 0 ? 'bg-destructive' : 'bg-primary'
            }`}
          >
            {totalCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Notificações
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma notificação no momento
                </p>
              ) : (
                notifications
                  .sort((a, b) => {
                    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                  })
                  .map(notification => (
                    <div
                      key={notification.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        <Badge className={getUrgencyColor(notification.urgency)}>
                          {notification.urgency}
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};