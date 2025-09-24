import { motion } from 'framer-motion';
import { BarChart3, FileDown, Calendar, TrendingUp, Users, Clock, Copy, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { supabase } from '@/integrations/supabase/client';
import { TaskRestriction } from '@/types';
import { useState, useEffect, useMemo } from 'react';

const Relatorios = () => {
  const { user, profile } = useAuth();
  const { projects, tasks, getTasksByUser, profiles } = useSupabaseData();
  const [showReport, setShowReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('own_data');
  const [reportType, setReportType] = useState<string>('completo');
  const [taskRestrictions, setTaskRestrictions] = useState<TaskRestriction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to get blocking reason
  const getBlockingReason = (restrictions: TaskRestriction[]) => {
    if (!restrictions || restrictions.length === 0) return '';
    return restrictions.map(r => r.blocking_task_title || 'Unknown Task').join(', ');
  };

  // Estado para controlar qual usuário está sendo visualizado
  const currentUserId = (selectedUserId === 'own_data' || !selectedUserId) ? user?.id || '' : selectedUserId;
  const currentUser = profiles.find(p => p.id === currentUserId) || user;

  const isAdmin = profile?.role === 'admin';


  // Carregamento das restrições de tarefas
  useEffect(() => {
    if (currentUserId) {
      loadTaskRestrictions();
    }
  }, [currentUserId, tasks]);

  const loadTaskRestrictions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_restrictions_detailed')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const formattedRestrictions: TaskRestriction[] = data?.map(item => ({
        id: item.id,
        waiting_task_id: item.waiting_task_id,
        blocking_task_id: item.blocking_task_id,
        blocking_user_id: item.blocking_user_id,
        status: item.status as 'active' | 'resolved' | 'cancelled',
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
        resolved_at: item.resolved_at
      })) || [];

      setTaskRestrictions(formattedRestrictions);
    } catch (error) {
      console.error('Erro ao carregar restrições:', error);
    }
  };

  if (!user) return null;

  // Função para obter projetos do usuário com dados completos e sincronizados
  const getProjectsByUser = (userId: string) => {
    return projects.filter(project =>
      project.responsible_ids && project.responsible_ids.includes(userId)
    );
  };

  // Função para obter tarefas com restrições integradas
  const getTasksWithRestrictions = (userId: string) => {
    const userTasks = getTasksByUser(userId);

    return userTasks.map(task => {
      // Buscar restrições ativas para esta tarefa
      const activeRestrictions = taskRestrictions.filter(restriction =>
        restriction.waiting_task_id === task.id && restriction.status === 'active'
      );

      // Buscar restrições onde esta tarefa está bloqueando outras
      const blockingRestrictions = taskRestrictions.filter(restriction =>
        restriction.blocking_task_id === task.id && restriction.status === 'active'
      );

      return {
        ...task,
        active_restrictions: activeRestrictions,
        blocking_restrictions: blockingRestrictions,
        can_start: activeRestrictions.length === 0
      };
    });
  };

  // Estatísticas integradas e sincronizadas
  const userProjects = getProjectsByUser(currentUserId);
  const userTasksWithRestrictions = getTasksWithRestrictions(currentUserId);

  const totalProjects = userProjects.length;
  const activeProjects = userProjects.filter(p => p.status === 'EM_ANDAMENTO').length;
  const completedProjects = userProjects.filter(p => p.status === 'CONCLUIDO' || p.status === 'FINALIZADO').length;
  const totalTasks = userTasksWithRestrictions.length;
  const completedTasks = userTasksWithRestrictions.filter(t => t.status === 'CONCLUIDA').length;
  const activeTasks = userTasksWithRestrictions.filter(t => t.status === 'EM_ANDAMENTO').length;
  const blockedTasks = userTasksWithRestrictions.filter(t => !t.can_start && t.status !== 'CONCLUIDA').length;

  // Função para obter o nome dos responsáveis por ID
  const getResponsibleNames = (responsibleIds: string[]) => {
    if (!responsibleIds || responsibleIds.length === 0) return 'Não atribuído';

    return responsibleIds.map(id => {
      const profile = profiles.find(p => p.id === id);
      return profile?.full_name || profile?.email || 'Usuário não encontrado';
    }).join(', ');
  };

  // Função para formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para obter data atual do sistema
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR');
  };

  // Função para obter detalhes das restrições de uma tarefa
  const getTaskRestrictionsDetails = (task: any) => {
    if (!task.active_restrictions || task.active_restrictions.length === 0) {
      return 'Nenhuma restrição ativa';
    }

    return task.active_restrictions.map((restriction: TaskRestriction) => {
      const blockingTask = tasks.find(t => t.id === restriction.blocking_task_id);
      const blockingUser = profiles.find(p => p.id === restriction.blocking_user_id);

      return `Aguardando: "${blockingTask?.title || 'Tarefa não encontrada'}" (responsável: ${blockingUser?.full_name || blockingUser?.email || 'Usuário não encontrado'})`;
    }).join('; ');
  };

  // Função para gerar o relatório padronizado e sincronizado
  const generateTaskReport = () => {
    const reportUserId = currentUserId;
    const reportUser = currentUser;

    const tasksWithRestrictions = getTasksWithRestrictions(reportUserId);
    const userProjects = getProjectsByUser(reportUserId);
    const activeUserProjects = userProjects.filter(p => p.status === 'EM_ANDAMENTO');

    // Filtrar tarefas baseado no tipo de relatório selecionado
    let filteredTasks = tasksWithRestrictions;
    switch (reportType) {
      case 'concluidas':
        filteredTasks = tasksWithRestrictions.filter(t => t.status === 'CONCLUIDA');
        break;
      case 'pendentes':
        filteredTasks = tasksWithRestrictions.filter(t => t.status !== 'CONCLUIDA');
        break;
      case 'bloqueadas':
        filteredTasks = tasksWithRestrictions.filter(t => !t.can_start && t.status !== 'CONCLUIDA');
        break;
      case 'completo':
      default:
        filteredTasks = tasksWithRestrictions;
        break;
    }

    const completedUserTasks = filteredTasks.filter(t => t.status === 'CONCLUIDA');
    const pendingUserTasks = filteredTasks.filter(t => t.status !== 'CONCLUIDA');
    const blockedUserTasks = filteredTasks.filter(t => !t.can_start && t.status !== 'CONCLUIDA');

    // Verificar tarefas próximas do prazo (próximos 7 dias)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingTasks = pendingUserTasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    });

    const reportTypeLabel = {
      'completo': 'COMPLETO',
      'concluidas': 'TAREFAS CONCLUÍDAS',
      'pendentes': 'TAREFAS PENDENTES',
      'bloqueadas': 'TAREFAS BLOQUEADAS'
    }[reportType] || 'COMPLETO';

    let report = `📊 RELATÓRIO DE TAREFAS ${reportTypeLabel} - ${(reportUser?.full_name || reportUser?.email || 'USUÁRIO').toUpperCase()}
📅 Data: ${getCurrentDate()}
🔄 Sincronizado com: Tasks, Projects e Task_Restrictions
━━━━━━━━━━━━━━━━━━━━━━━━━

📂 PROJETOS ATIVOS (${activeUserProjects.length}):

`;

    // Lista de projetos ativos
    activeUserProjects.forEach((project, index) => {
      const projectNumber = index + 1;
      const emoji = projectNumber <= 5 ? `${projectNumber}️⃣` : `${projectNumber}️⃣`;

      // Formatar valores financeiros
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      };

      // Contar tarefas deste projeto
      const projectTasks = filteredTasks.filter(t => t.project_id === project.id);
      const projectCompletedTasks = projectTasks.filter(t => t.status === 'CONCLUIDA').length;
      const projectPendingTasks = projectTasks.filter(t => t.status !== 'CONCLUIDA').length;

      report += `${emoji} ${project.name}
- Cliente: ${project.client}
- Status: ${project.status}
- Tipo: ${project.type === 'publico' ? 'Público' : 'Privado'}
- Responsáveis: ${getResponsibleNames(project.responsible_ids)}
- Tarefas: ${projectCompletedTasks} concluídas | ${projectPendingTasks} pendentes
- Início: ${formatDate(project.contract_start)} | Fim: ${formatDate(project.contract_end)}${project.project_value ? `
- Valor: ${formatCurrency(project.project_value)}` : ''}${project.amount_paid ? `
- Pago: ${formatCurrency(project.amount_paid)}` : ''}

`;
    });

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ${reportTypeLabel} (${filteredTasks.length}):
${blockedUserTasks.length > 0 ? `🚫 ${blockedUserTasks.length} tarefas bloqueadas por restrições\n` : ''}
`;

    // Lista de tarefas filtradas com informações de restrições
    filteredTasks.forEach((task, index) => {
      const project = projects.find(p => p.id === task.project_id);
      const isUpcoming = upcomingTasks.some(t => t.id === task.id);
      const statusEmoji = task.status === 'CONCLUIDA' ? '✅' :
                         task.status === 'EM_ANDAMENTO' ? '🔄' :
                         !task.can_start ? '🚫' : '⏳';

      // Obter co-responsáveis (excluindo o usuário atual)
      let coResponsible = '';
      if (Array.isArray(task.assigned_to)) {
        const otherResponsibles = task.assigned_to.filter((id: string) => id !== reportUserId);
        if (otherResponsibles.length > 0) {
          coResponsible = `👥 Co-responsável: ${getResponsibleNames(otherResponsibles)}`;
        }
      }

      // Informações de restrições detalhadas
      const restrictionsInfo = getTaskRestrictionsDetails(task);
      const hasRestrictions = task.active_restrictions && task.active_restrictions.length > 0;

      report += `${statusEmoji} TAREFA ${index + 1}${!task.can_start ? ' [BLOQUEADA]' : ''}
📌 Título: ${task.title}
🏗️ Projeto: ${project?.name || 'Projeto não encontrado'}${coResponsible ? '\n' + coResponsible : ''}
📊 Fase: ${task.phase || '-'}
🔄 Status: ${task.status}${task.status === 'CONCLUIDA' ? ' ✅' : ''}
${hasRestrictions ? `🚫 Restrições: ${restrictionsInfo}` : '✅ Sem restrições - pode iniciar'}
🏆 Pontos: ${task.points || 0} pontos
⚡ Prioridade: ${task.priority === 'alta' ? 'Alta 🔴' : task.priority === 'media' ? 'Média 🟡' : 'Baixa 🟢'}
📅 Início: ${formatDate(task.activity_start)}
⏰ Prazo: ${formatDate(task.due_date)}${isUpcoming ? ' ⚠️ PRÓXIMO' : ''}
📝 Entrega: ${formatDate(task.completed_at)}${task.status === 'CONCLUIDA' ? ' ✅' : ''}
💬 Observações: ${task.comment || '-'}

━━━━━━━━━━━━━━━━━━━━━
`;
    });

    // Resumo final com estatísticas completas
    const totalPoints = filteredTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const completedPoints = completedUserTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const pendingPoints = pendingUserTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const blockedPoints = blockedUserTasks.reduce((sum, task) => sum + (task.points || 0), 0);

    report += `
📊 RESUMO EXECUTIVO:
━━━━━━━━━━━━━━━━━━━━━━━━━
📈 ESTATÍSTICAS GERAIS:
- Total de Projetos: ${totalProjects}
- Projetos Ativos: ${activeProjects}
- Projetos Concluídos: ${completedProjects}

📋 ANÁLISE DE TAREFAS (${reportTypeLabel}):
- Total: ${filteredTasks.length}
- Concluídas: ${completedUserTasks.length} ✅
- Pendentes: ${pendingUserTasks.length} ⏳
- Bloqueadas: ${blockedUserTasks.length} 🚫
- Podem iniciar: ${filteredTasks.filter(t => t.can_start && t.status !== 'CONCLUIDA').length} 🟢${upcomingTasks.length > 0 ? `
- Próximas (7 dias): ${upcomingTasks.length} ⚠️` : ''}

🏆 PONTUAÇÃO:
- Total Disponível: ${totalPoints} pontos
- Conquistada: ${completedPoints} pontos ✅
- Pendente: ${pendingPoints} pontos ⏳
- Bloqueada: ${blockedPoints} pontos 🚫
- Taxa de Conquista: ${totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%

🚫 ANÁLISE DE RESTRIÇÕES:
- Tarefas com restrições ativas: ${filteredTasks.filter(t => !t.can_start).length}
- Tarefas liberadas: ${filteredTasks.filter(t => t.can_start).length}
- Eficiência (sem bloqueios): ${filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.can_start).length / filteredTasks.length) * 100) : 100}%

━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Relatório sincronizado com todas as tabelas do sistema
🔄 Tasks | Projects | Task_Restrictions | Profiles
⏰ Gerado em: ${new Date().toLocaleString('pt-BR')}`;

    return report;
  };

  // Função para copiar relatório
  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(generatedReport);
      alert('Relatório copiado para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      alert('Erro ao copiar o relatório');
    }
  };

  // Função para gerar e mostrar relatório
  const handleGenerateReport = () => {
    const report = generateTaskReport();
    setGeneratedReport(report);
    setShowReport(true);
  };

  // Função para atualizar dados
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTaskRestrictions();
      // Os outros dados são atualizados automaticamente pelo contexto
    } finally {
      setRefreshing(false);
    }
  };

  // Função para gerar cronograma de tarefas em ordem cronológica
  const generateProjectTimeline = () => {
    const tasksWithRestrictions = getTasksWithRestrictions(currentUserId);

    // Filtrar apenas tarefas pendentes e com prazo definido, depois ordenar por data
    const pendingTasksWithDueDate = tasksWithRestrictions
      .filter(task => task.due_date && task.status !== 'CONCLUIDA')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const today = new Date();

    // Separar tarefas por urgência
    const overdueTasks = pendingTasksWithDueDate.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate < today;
    });

    const urgentTasks = pendingTasksWithDueDate.filter(task => {
      const dueDate = new Date(task.due_date);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });

    const normalTasks = pendingTasksWithDueDate.filter(task => {
      const dueDate = new Date(task.due_date);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    });

    let timeline = `📅 CRONOGRAMA DE TAREFAS - ${(currentUser?.full_name || currentUser?.email || 'USUÁRIO').toUpperCase()}
📅 Gerado em: ${getCurrentDate()}
🔄 Total: ${pendingTasksWithDueDate.length} tarefas pendentes com prazo
━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    // TAREFAS VENCIDAS
    if (overdueTasks.length > 0) {
      timeline += `🚨 TAREFAS VENCIDAS (${overdueTasks.length}):

`;
      overdueTasks.forEach((task, index) => {
        const project = projects.find(p => p.id === task.project_id);
        const dueDate = new Date(task.due_date);
        const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        timeline += `${index + 1}. ❌ "${task.title}"
   📁 ${project?.title || 'Projeto N/A'}
   📅 Venceu há ${daysOverdue} dia(s) - ${dueDate.toLocaleDateString('pt-BR')}
   ${task.active_restrictions?.length > 0 ? '🚫 BLOQUEADA: ' + getBlockingReason(task.active_restrictions) : '✅ Pode iniciar agora'}

`;
      });
    }

    // TAREFAS URGENTES (próximos 7 dias)
    if (urgentTasks.length > 0) {
      timeline += `⚡ TAREFAS URGENTES - Próximos 7 dias (${urgentTasks.length}):

`;
      urgentTasks.forEach((task, index) => {
        const project = projects.find(p => p.id === task.project_id);
        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        timeline += `${index + 1}. ⚡ "${task.title}"
   📁 ${project?.title || 'Projeto N/A'}
   📅 ${daysUntilDue === 0 ? '🔥 VENCE HOJE!' : `Prazo: ${daysUntilDue} dia(s)`} - ${dueDate.toLocaleDateString('pt-BR')}
   ${task.active_restrictions?.length > 0 ? '🚫 BLOQUEADA: ' + getBlockingReason(task.active_restrictions) : '✅ Pode iniciar agora'}

`;
      });
    }

    // PRÓXIMAS TAREFAS (mais de 7 dias)
    if (normalTasks.length > 0) {
      timeline += `📋 PRÓXIMAS TAREFAS - Cronograma Completo (${normalTasks.length}):

`;
      normalTasks.slice(0, 15).forEach((task, index) => {  // Limitar a 15 tarefas para não ficar muito longo
        const project = projects.find(p => p.id === task.project_id);
        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        timeline += `${index + 1}. 📅 "${task.title}"
   📁 ${project?.title || 'Projeto N/A'}
   📅 Em ${daysUntilDue} dias - ${dueDate.toLocaleDateString('pt-BR')}
   ${task.active_restrictions?.length > 0 ? '🚫 BLOQUEADA: ' + getBlockingReason(task.active_restrictions) : '✅ Pode iniciar agora'}

`;
      });

      if (normalTasks.length > 15) {
        timeline += `... e mais ${normalTasks.length - 15} tarefas futuras.

`;
      }
    }

    timeline += `━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMO:
• Vencidas: ${overdueTasks.length}
• Urgentes (≤7 dias): ${urgentTasks.length}
• Futuras: ${normalTasks.length}
• Bloqueadas: ${pendingTasksWithDueDate.filter(t => t.active_restrictions?.length > 0).length}

🎯 FOCO: ${overdueTasks.length > 0 ? 'Resolver tarefas vencidas primeiro!' : urgentTasks.length > 0 ? 'Priorizar tarefas urgentes!' : 'Bom trabalho, sem tarefas críticas!'}`;

    return timeline;
  };

  // Função para gerar relatório de desempenho (atualizada)
  const generatePerformanceReport = () => {
    const tasksWithRestrictions = getTasksWithRestrictions(currentUserId);
    const completedTasks = tasksWithRestrictions.filter(t => t.status === 'CONCLUIDA');
    const pendingTasks = tasksWithRestrictions.filter(t => t.status !== 'CONCLUIDA');

    // Calcular estatísticas básicas
    const totalDeliveries = completedTasks.length;

    let anticipatedCount = 0;
    let onTimeCount = 0;
    let delayedCount = 0;
    let totalPoints = 0;

    completedTasks.forEach(task => {
      if (!task.due_date || !task.completed_at) return;

      const daysDiff = Math.floor((new Date(task.due_date).getTime() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff > 0) {
        anticipatedCount++;
        totalPoints += daysDiff * 2;
      } else if (daysDiff < 0) {
        delayedCount++;
        totalPoints += daysDiff * 4; // negativo
      } else {
        onTimeCount++;
      }
    });

    // Analisar tarefas pendentes por urgência
    const today = new Date();
    const overduePending = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < today).length;
    const urgentPending = pendingTasks.filter(t => {
      if (!t.due_date) return false;
      const days = Math.ceil((new Date(t.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return days <= 7 && days >= 0;
    }).length;

    // Determinar classificação simples
    let classification = '';
    let classificationColor = '';
    if (totalPoints >= 20) {
      classification = 'Excelente';
      classificationColor = '🏆';
    } else if (totalPoints >= 0) {
      classification = 'Bom';
      classificationColor = '👍';
    } else if (totalPoints >= -20) {
      classification = 'Regular';
      classificationColor = '⚠️';
    } else {
      classification = 'Precisa Melhorar';
      classificationColor = '📊';
    }

    const performance = `📊 ANÁLISE DE DESEMPENHO - ${(currentUser?.full_name || currentUser?.email || 'USUÁRIO').toUpperCase()}
📅 Período: ${getCurrentDate()}
━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 RESUMO GERAL:
• Total de tarefas concluídas: ${totalDeliveries}
• Pontuação atual: ${totalPoints} pontos
• Classificação: ${classificationColor} ${classification}

📈 HISTÓRICO DE ENTREGAS:
• ✅ Antecipadas: ${anticipatedCount} (${totalDeliveries > 0 ? Math.round((anticipatedCount / totalDeliveries) * 100) : 0}%)
• 🎯 No prazo: ${onTimeCount} (${totalDeliveries > 0 ? Math.round((onTimeCount / totalDeliveries) * 100) : 0}%)
• ⏰ Atrasadas: ${delayedCount} (${totalDeliveries > 0 ? Math.round((delayedCount / totalDeliveries) * 100) : 0}%)

⚡ SITUAÇÃO ATUAL:
• 🚨 Tarefas vencidas: ${overduePending}
• ⚠️ Tarefas urgentes (≤7 dias): ${urgentPending}
• 📋 Total pendentes: ${pendingTasks.length}

${totalDeliveries === 0 ? `
🔔 PRIMEIRA ANÁLISE:
Ainda não há tarefas concluídas para análise.
Complete algumas tarefas para ver seu desempenho!` : ''}

${totalPoints < 0 ? `
💡 DICAS PARA MELHORAR:
• Priorize tarefas com prazo mais próximo
• Monitore bloqueios e restrições
• Comunique atrasos com antecedência
• Use o cronograma para se organizar` : ''}

${totalPoints >= 20 ? `
🎉 PARABÉNS!
Você está mantendo um excelente desempenho!
Continue priorizando entregas antecipadas.` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━
Sistema: +2 pontos/dia antecipado | -4 pontos/dia atrasado`;

    return performance;
  };

  // Funções para mostrar relatórios
  const handleShowTimeline = () => {
    const timeline = generateProjectTimeline();
    setGeneratedReport(timeline);
    setShowTimeline(true);
  };

  const handleShowPerformance = () => {
    const performance = generatePerformanceReport();
    setGeneratedReport(performance);
    setShowPerformance(true);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios Integrados</h1>
            <p className="text-muted-foreground">
              Sistema completo sincronizado com Tarefas • Restrições • Projetos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Sincronizando...' : 'Atualizar'}
            </Button>

            {/* Filtro para Administradores */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="user-select">Usuário:</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-[200px]" id="user-select">
                    <SelectValue placeholder="Seus próprios dados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own_data">Seus dados</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name || profile.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Estatísticas Resumo com Restrições */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} ativos • {completedProjects} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {activeTasks} ativas • {completedTasks} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{blockedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Por restrições ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round(((totalTasks - blockedTasks) / totalTasks) * 100) : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              Sem bloqueios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Geradores de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Desempenho Completo
            </CardTitle>
            <CardDescription>Análise detalhada com restrições</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Análise</Label>
              <p className="text-sm text-muted-foreground">
                Histórico completo sincronizado com todas as tabelas
              </p>
            </div>
            <Button className="w-full" onClick={handleShowPerformance}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Gerar Desempenho
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-success" />
              Cronograma Integrado
            </CardTitle>
            <CardDescription>Timeline com status de restrições</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timeline</Label>
              <p className="text-sm text-muted-foreground">
                Prazos organizados com análise de bloqueios
              </p>
            </div>
            <Button className="w-full" onClick={handleShowTimeline}>
              <Calendar className="h-4 w-4 mr-2" />
              Gerar Cronograma
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileDown className="h-5 w-5 mr-2 text-accent" />
              Relatório Sincronizado
            </CardTitle>
            <CardDescription>Dados completos das 3 tabelas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completo">Relatório Completo</SelectItem>
                  <SelectItem value="concluidas">Apenas Concluídas</SelectItem>
                  <SelectItem value="pendentes">Apenas Pendentes</SelectItem>
                  <SelectItem value="bloqueadas">Apenas Bloqueadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleGenerateReport}>
              <FileDown className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal do Relatório */}
      {(showReport || showTimeline || showPerformance) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {showReport && `Relatório de Tarefas ${reportType !== 'completo' ? `- ${reportType.toUpperCase()}` : ''}`}
                {showTimeline && 'Cronograma Integrado'}
                {showPerformance && 'Desempenho Completo'}
              </h3>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Sincronizado
                </Badge>
                <Button variant="outline" size="sm" onClick={copyReport}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowReport(false);
                  setShowTimeline(false);
                  setShowPerformance(false);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border">
                {generatedReport}
              </pre>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  📊 Relatório gerado em {new Date().toLocaleString('pt-BR')} | 🔄 Dados sincronizados
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyReport}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Texto
                  </Button>
                  <Button onClick={() => {
                    setShowReport(false);
                    setShowTimeline(false);
                    setShowPerformance(false);
                  }}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;