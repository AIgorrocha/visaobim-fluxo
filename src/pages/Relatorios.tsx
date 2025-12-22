import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  FileText,
  Copy,
  Check,
  Filter,
  User,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useToast } from '@/hooks/use-toast';

const Relatorios = () => {
  const { user, profile } = useAuth();
  const { tasks, projects, profiles, taskRestrictions } = useSupabaseData();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<string>(user?.id || '');
  const [copiedReport, setCopiedReport] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  // Usuários para filtro (admin vê todos, usuário vê apenas ele mesmo)
  const availableUsers = useMemo(() => {
    if (isAdmin) {
      return profiles;
    } else {
      return profiles.filter(p => p.id === user?.id);
    }
  }, [profiles, isAdmin, user?.id]);

  // Filtrar tarefas do usuário selecionado (excluindo arquivadas)
  const userTasks = useMemo(() => {
    return tasks.filter(task => {
      // Excluir tarefas arquivadas dos relatórios
      if (task.is_archived) return false;

      if (Array.isArray(task.assigned_to)) {
        return task.assigned_to.includes(selectedUser);
      } else {
        return task.assigned_to === selectedUser;
      }
    });
  }, [tasks, selectedUser]);

  // Projetos do usuário selecionado
  const userProjects = useMemo(() => {
    return projects.filter(project =>
      project.responsible_ids?.includes(selectedUser)
    );
  }, [projects, selectedUser]);

  // Função para copiar texto
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReport(type);
      toast({
        title: "Relatório copiado!",
        description: "Relatório copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedReport(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o relatório.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para obter dados do usuário
  const getUserData = (userId: string) => {
    return profiles.find(p => p.id === userId);
  };

  // RELATÓRIO COMPLETO
  const generateCompleteReport = () => {
    const userData = getUserData(selectedUser);
    const now = new Date();
    const today = now.toLocaleDateString('pt-BR');
    const timeNow = now.toLocaleTimeString('pt-BR');

    // Categorizar tarefas
    const completedTasks = userTasks.filter(t => t.status === 'CONCLUIDA');
    const pendingTasks = userTasks.filter(t => t.status === 'PENDENTE');
    const blockedTasks = userTasks.filter(t => {
      return taskRestrictions.some(r =>
        r.waiting_task_id === t.id && r.status === 'active'
      );
    });

    const activeProjects = userProjects.filter(p => p.status !== 'CONCLUIDO');
    const completedProjects = userProjects.filter(p => p.status === 'CONCLUIDO');

    // Calcular pontuação

    let report = `📊 RELATÓRIO DE TAREFAS COMPLETO - ${userData?.full_name?.toUpperCase() || 'USUÁRIO'}\n`;
    report += `📅 Data: ${today}\n`;
    report += `🔄 Sincronizado com: Tasks, Projects e Task_Restrictions\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    report += `📂 PROJETOS ATIVOS (${activeProjects.length}):\n\n`;

    if (activeProjects.length === 0) {
      report += `Nenhum projeto ativo.\n\n`;
    } else {
      activeProjects.forEach((project, index) => {
        report += `${index + 1}. ${project.name}\n`;
        report += `   Cliente: ${project.client}\n`;
        report += `   Status: ${project.status}\n`;
        if (project.contract_end) {
          report += `   Prazo: ${formatDate(project.contract_end)}\n`;
        }
        report += `\n`;
      });
    }

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    report += `📋 TAREFAS COMPLETAS (${userTasks.length}):\n\n`;

    if (userTasks.length === 0) {
      report += `Nenhuma tarefa atribuída.\n\n`;
    } else {
      userTasks.forEach((task, index) => {
        const project = projects.find(p => p.id === task.project_id);
        const statusEmoji = task.status === 'CONCLUIDA' ? '✅' :
                          task.status === 'EM_ANDAMENTO' ? '🔄' :
                          task.status === 'PARALISADA' ? '❌' : '⏳';

        const isBlocked = taskRestrictions.some(r =>
          r.waiting_task_id === task.id && r.status === 'active'
        );

        report += `${statusEmoji} TAREFA ${index + 1}\n`;
        report += `📌 Título: ${task.title}\n`;
        report += `🏗️ Projeto: ${project?.name || 'N/A'}\n`;
        report += `📊 Fase: ${task.phase}\n`;
        report += `🔄 Status: ${task.status}${task.status === 'CONCLUIDA' ? ' ✅' : ''}\n`;

        if (isBlocked) {
          report += `🚫 Bloqueada - aguardando dependências\n`;
        } else {
          report += `✅ Sem restrições - pode iniciar\n`;
        }

        if (task.activity_start) {
          report += `📅 Início: ${formatDate(task.activity_start)}\n`;
        }

        if (task.due_date) {
          report += `⏰ Prazo: ${formatDate(task.due_date)}\n`;
        }

        if (task.last_delivery) {
          report += `📝 Entrega: ${formatDate(task.last_delivery)} ✅\n`;
        } else {
          report += `📝 Entrega: -\n`;
        }

        if (task.comment) {
          report += `💬 Observações: ${task.comment}\n`;
        }

        report += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      });
    }

    report += `\n📊 RESUMO EXECUTIVO:\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `📈 ESTATÍSTICAS GERAIS:\n`;
    report += `- Total de Projetos: ${userProjects.length}\n`;
    report += `- Projetos Ativos: ${activeProjects.length}\n`;
    report += `- Projetos Concluídos: ${completedProjects.length}\n\n`;

    report += `📋 ANÁLISE DE TAREFAS (COMPLETO):\n`;
    report += `- Total: ${userTasks.length}\n`;
    report += `- Concluídas: ${completedTasks.length} ✅\n`;
    report += `- Pendentes: ${pendingTasks.length} ⏳\n`;
    report += `- Bloqueadas: ${blockedTasks.length} 🚫\n`;
    report += `- Podem iniciar: ${pendingTasks.length - blockedTasks.length} 🟢\n\n`;


    report += `🚫 ANÁLISE DE RESTRIÇÕES:\n`;
    report += `- Tarefas com restrições ativas: ${blockedTasks.length}\n`;
    report += `- Tarefas liberadas: ${userTasks.length - blockedTasks.length}\n`;
    report += `- Eficiência (sem bloqueios): ${userTasks.length > 0 ? Math.round(((userTasks.length - blockedTasks.length) / userTasks.length) * 100) : 100}%\n\n`;

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `📅 Relatório com dados em tempo real do Supabase\n`;
    report += `🔄 Tasks | Projects | Task_Restrictions | Profiles | Automatic Scoring\n`;
    report += `⏰ Gerado em: ${today}, ${timeNow}`;

    return report;
  };

  // CRONOGRAMA
  const generateScheduleReport = () => {
    const userData = getUserData(selectedUser);
    const now = new Date();
    const today = now.toLocaleDateString('pt-BR');

    const tasksWithDeadlines = userTasks.filter(t => t.due_date && t.status !== 'CONCLUIDA');
    const overdueTasks = tasksWithDeadlines.filter(t => new Date(t.due_date!) < now);
    const urgentTasks = tasksWithDeadlines.filter(t => {
      const dueDate = new Date(t.due_date!);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
    const futureTasks = tasksWithDeadlines.filter(t => {
      const dueDate = new Date(t.due_date!);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    });

    const blockedTasks = userTasks.filter(t => {
      return taskRestrictions.some(r =>
        r.waiting_task_id === t.id && r.status === 'active'
      );
    });

    let report = `📅 CRONOGRAMA DE TAREFAS - ${userData?.full_name?.toUpperCase() || 'USUÁRIO'}\n`;
    report += `📅 Gerado em: ${today}\n`;
    report += `🔄 Total: ${tasksWithDeadlines.length} tarefas pendentes com prazo\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (overdueTasks.length > 0) {
      report += `🚨 TAREFAS VENCIDAS (${overdueTasks.length}):\n\n`;

      overdueTasks.forEach((task, index) => {
        const project = projects.find(p => p.id === task.project_id);
        const daysOverdue = Math.ceil((now.getTime() - new Date(task.due_date!).getTime()) / (1000 * 60 * 60 * 24));
        const isBlocked = taskRestrictions.some(r =>
          r.waiting_task_id === task.id && r.status === 'active'
        );

        report += `${index + 1}. ❌ "${task.title}"\n`;
        report += `   📁 Projeto ${project?.name || 'N/A'}\n`;
        report += `   📅 Venceu há ${daysOverdue} dia(s) - ${formatDate(task.due_date!)}\n`;
        report += `   ${isBlocked ? '🚫 Bloqueada por dependências' : '✅ Pode iniciar agora'}\n\n`;
      });

      report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    if (urgentTasks.length > 0) {
      report += `⚡ TAREFAS URGENTES - Próximos 7 dias (${urgentTasks.length}):\n\n`;

      urgentTasks.forEach((task, index) => {
        const project = projects.find(p => p.id === task.project_id);
        const dueDate = new Date(task.due_date!);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isBlocked = taskRestrictions.some(r =>
          r.waiting_task_id === task.id && r.status === 'active'
        );

        report += `${index + 1}. ⚡ "${task.title}"\n`;
        report += `   📁 Projeto ${project?.name || 'N/A'}\n`;
        report += `   📅 ${diffDays === 0 ? '🔥 VENCE HOJE!' : `Em ${diffDays} dias`} - ${formatDate(task.due_date!)}\n`;
        report += `   ${isBlocked ? '🚫 Bloqueada por dependências' : '✅ Pode iniciar agora'}\n\n`;
      });

      report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    if (futureTasks.length > 0) {
      report += `📋 PRÓXIMAS TAREFAS - Cronograma Completo (${futureTasks.length}):\n\n`;

      // Ordenar por data de vencimento
      const sortedFutureTasks = futureTasks.sort((a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      );

      sortedFutureTasks.forEach((task, index) => {
        const project = projects.find(p => p.id === task.project_id);
        const dueDate = new Date(task.due_date!);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isBlocked = taskRestrictions.some(r =>
          r.waiting_task_id === task.id && r.status === 'active'
        );

        report += `${index + 1}. 📅 "${task.title}"\n`;
        report += `   📁 Projeto ${project?.name || 'N/A'}\n`;
        report += `   📅 Em ${diffDays} dias - ${formatDate(task.due_date!)}\n`;
        report += `   ${isBlocked ? '🚫 Bloqueada por dependências' : '✅ Pode iniciar agora'}\n\n`;
      });

      report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    report += `📊 RESUMO:\n`;
    report += `• Vencidas: ${overdueTasks.length}\n`;
    report += `• Urgentes (≤7 dias): ${urgentTasks.length}\n`;
    report += `• Futuras: ${futureTasks.length}\n`;
    report += `• Bloqueadas: ${blockedTasks.length}\n\n`;
    report += `🎯 FOCO: ${overdueTasks.length > 0 ? 'Resolver tarefas vencidas primeiro!' : 'Manter ritmo das tarefas urgentes!'}`;

    return report;
  };

  // DESEMPENHO
  const generatePerformanceReport = () => {
    const userData = getUserData(selectedUser);
    const today = new Date().toLocaleDateString('pt-BR');

    const completedTasks = userTasks.filter(t => t.status === 'CONCLUIDA');

    // Análise de entregas
    const onTimeTasks = completedTasks.filter(t => {
      if (!t.due_date || !t.last_delivery) return false;
      const dueDate = new Date(t.due_date);
      const deliveryDate = new Date(t.last_delivery);
      return deliveryDate <= dueDate;
    });

    const earlyTasks = completedTasks.filter(t => {
      if (!t.due_date || !t.last_delivery) return false;
      const dueDate = new Date(t.due_date);
      const deliveryDate = new Date(t.last_delivery);
      return deliveryDate < dueDate;
    });

    const lateTasks = completedTasks.filter(t => {
      if (!t.due_date || !t.last_delivery) return false;
      const dueDate = new Date(t.due_date);
      const deliveryDate = new Date(t.last_delivery);
      return deliveryDate > dueDate;
    });

    const overdueTasks = userTasks.filter(t => {
      if (t.status === 'CONCLUIDA' || !t.due_date) return false;
      return new Date(t.due_date) < new Date();
    });

    const urgentTasks = userTasks.filter(t => {
      if (t.status === 'CONCLUIDA' || !t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    const pendingTasks = userTasks.filter(t => t.status !== 'CONCLUIDA');


    let report = `📊 ANÁLISE DE DESEMPENHO - ${userData?.full_name?.toUpperCase() || 'USUÁRIO'}\n`;
    report += `📅 Período: ${today}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    report += `🎯 RESUMO GERAL:\n`;
    report += `• Total de tarefas concluídas: ${completedTasks.length}\n`;

    report += `📈 HISTÓRICO DE ENTREGAS:\n`;
    if (completedTasks.length > 0) {
      const earlyPercentage = Math.round((earlyTasks.length / completedTasks.length) * 100);
      const onTimePercentage = Math.round((onTimeTasks.length / completedTasks.length) * 100);
      const latePercentage = Math.round((lateTasks.length / completedTasks.length) * 100);

      report += `• ✅ Antecipadas: ${earlyTasks.length} (${earlyPercentage}%)\n`;
      report += `• 🎯 No prazo: ${onTimeTasks.length} (${onTimePercentage}%)\n`;
      report += `• ⏰ Atrasadas: ${lateTasks.length} (${latePercentage}%)\n\n`;
    } else {
      report += `• ✅ Antecipadas: 0 (0%)\n`;
      report += `• 🎯 No prazo: 0 (0%)\n`;
      report += `• ⏰ Atrasadas: 0 (0%)\n\n`;
    }

    report += `⚡ SITUAÇÃO ATUAL:\n`;
    report += `• 🚨 Tarefas vencidas: ${overdueTasks.length}\n`;
    report += `• ⚠️ Tarefas urgentes (≤7 dias): ${urgentTasks.length}\n`;
    report += `• 📋 Total pendentes: ${pendingTasks.length}\n\n`;


    report += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `Sistema de acompanhamento de tarefas e prazos`;

    return report;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Relatórios completos de tarefas, cronograma e desempenho
          </p>
        </div>

        {/* User Filter */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar usuário" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {userTasks.filter(t => t.status === 'CONCLUIDA').length} concluídas
              </p>
            </CardContent>
          </Card>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                {userProjects.filter(p => p.status === 'EM_ANDAMENTO').length} em andamento
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userTasks.length > 0 ?
                  Math.round((userTasks.filter(t => t.status === 'CONCLUIDA').length / userTasks.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {userTasks.filter(t => t.status === 'CONCLUIDA').length} de {userTasks.length} tarefas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reports Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="complete" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="complete">Relatório Completo</TabsTrigger>
            <TabsTrigger value="schedule">Cronograma</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
          </TabsList>

          {/* Relatório Completo */}
          <TabsContent value="complete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Relatório Completo
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateCompleteReport(), 'complete')}
                    className="flex items-center gap-2"
                  >
                    {copiedReport === 'complete' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar para WhatsApp
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Relatório detalhado com todas as tarefas, projetos e análises completas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg max-h-96 overflow-y-auto font-mono">
                  {generateCompleteReport()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cronograma */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Cronograma de Tarefas
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateScheduleReport(), 'schedule')}
                    className="flex items-center gap-2"
                  >
                    {copiedReport === 'schedule' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar para WhatsApp
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Cronograma de tarefas com foco em prazos e urgências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg max-h-96 overflow-y-auto font-mono">
                  {generateScheduleReport()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desempenho */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Análise de Desempenho
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatePerformanceReport(), 'performance')}
                    className="flex items-center gap-2"
                  >
                    {copiedReport === 'performance' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar para WhatsApp
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Análise individual de desempenho com métricas de pontuação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg max-h-96 overflow-y-auto font-mono">
                  {generatePerformanceReport()}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Relatorios;