import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Trophy, Edit, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
  showProject?: boolean;
  showAssignee?: boolean;
  projectName?: string;
  assigneeName?: string;
  index?: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onView,
  showProject = true,
  showAssignee = false,
  projectName,
  assigneeName,
  index = 0
}) => {
  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(task.priority)}
                <h3 className="font-semibold text-base md:text-lg">{task.title}</h3>
              </div>
              
              {task.description && (
                <p className="text-muted-foreground text-sm">{task.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {task.points} pontos
                </Badge>
              </div>
              
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  {showProject && projectName && (
                    <>
                      <span>Projeto: {projectName}</span>
                      <span className="hidden sm:inline">•</span>
                    </>
                  )}
                  {showAssignee && assigneeName && (
                    <>
                      <span>Atribuído a: {assigneeName}</span>
                      <span className="hidden sm:inline">•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className={isOverdue(task.due_date) ? 'text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-md' : ''}>
                      Prazo: {formatDate(task.due_date)}
                      {isOverdue(task.due_date) && ' ⚠️ ATRASADO'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
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

              {/* Mostrar restrições se existirem */}
              {task.restricoes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Restrições (aguardando liberação):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(task.restricoes) ? 
                      task.restricoes.map((restriction, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {restriction}
                        </Badge>
                      )) : 
                      <Badge variant="secondary" className="text-xs">
                        {task.restricoes}
                      </Badge>
                    }
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-row sm:flex-col gap-2">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(task)}
                  className="flex-1 sm:flex-none whitespace-nowrap"
                >
                  <Eye className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Visualizar</span>
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(task)}
                  className="flex-1 sm:flex-none whitespace-nowrap"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};