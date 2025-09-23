import { motion } from 'framer-motion';
import { BarChart3, FileDown, Calendar, TrendingUp, Users, Clock, Copy, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useState } from 'react';

const Relatorios = () => {
  const { user } = useAuth();
  const { projects, tasks, getTasksByUser, profiles } = useSupabaseData();
  const [showReport, setShowReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Estado para controlar qual usuário está sendo visualizado
  const currentUserId = selectedUserId || user?.id || '';
  const currentUser = profiles.find(p => p.id === currentUserId) || user;

  if (!user) return null;

  const isAdmin = user?.role === 'admin';

  // Função para obter projetos do usuário
  const getProjectsByUser = (userId: string) => {
    return projects.filter(project => 
      project.responsible_ids && project.responsible_ids.includes(userId)
    );
  };

  // Estatísticas básicas para relatórios (baseadas no usuário selecionado)
  const userProjects = isAdmin && selectedUserId ? getProjectsByUser(currentUserId) : getProjectsByUser(user?.id || '');
  const userTasks = isAdmin && selectedUserId ? getTasksByUser(currentUserId) : getTasksByUser(user?.id || '');
  
  const totalProjects = userProjects.length;
  const activeProjects = userProjects.filter(p => p.status === 'EM_ANDAMENTO').length;
  const completedProjects = userProjects.filter(p => p.status === 'CONCLUIDO' || p.status === 'FINALIZADO').length;
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(t => t.status === 'CONCLUIDA').length;
  const activeTasks = userTasks.filter(t => t.status === 'EM_ANDAMENTO').length;

  // Função para obter o nome dos responsáveis por ID
  const getResponsibleNames = (responsibleIds: string[]) => {
    if (!responsibleIds || responsibleIds.length === 0) return 'Não atribuído';
    
    return responsibleIds.map(id => {
      const profile = profiles.find(p => p.id === id);
      return profile?.full_name || 'Usuário não encontrado';
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

  // Função para gerar o relatório padronizado
  const generateTaskReport = () => {
    const reportUserId = isAdmin && selectedUserId ? selectedUserId : user?.id || '';
    const reportUser = isAdmin && selectedUserId ? currentUser : user;
    const userTasks = getTasksByUser(reportUserId);
    const userProjects = getProjectsByUser(reportUserId);
    const activeUserProjects = userProjects.filter(p => p.status === 'EM_ANDAMENTO');

    const completedUserTasks = userTasks.filter(t => t.status === 'CONCLUIDA');
    const pendingUserTasks = userTasks.filter(t => t.status === 'PENDENTE');

    // Verificar tarefas próximas do prazo (próximos 7 dias)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingTasks = pendingUserTasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    });

    let report = `📊 RELATÓRIO DE TAREFAS - ${(reportUser?.full_name || reportUser?.email || 'USUÁRIO').toUpperCase()}
📅 Data: ${getCurrentDate()}
━━━━━━━━━━━━━━━━━━━━━━━━━

📂 SEUS PROJETOS ATIVOS:

`;

    // Lista de projetos ativos
    activeUserProjects.forEach((project, index) => {
      const projectNumber = index + 1;
      const emoji = projectNumber === 1 ? '1️⃣' : projectNumber === 2 ? '2️⃣' : projectNumber === 3 ? '3️⃣' : projectNumber === 4 ? '4️⃣' : projectNumber === 5 ? '5️⃣' : `${projectNumber}️⃣`;

      // Formatar valores financeiros
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      };

      report += `${emoji} ${project.name}
- Cliente: ${project.client}
- Status do Projeto: ${project.status}
- Tipo: ${project.type === 'publico' ? 'Público' : 'Privado'}
- Seus responsáveis no projeto: ${getResponsibleNames(project.responsible_ids)}
- Início do Contrato: ${formatDate(project.contract_start)}
- Fim do Contrato: ${formatDate(project.contract_end)}${project.project_value ? `
- Valor do Projeto: ${formatCurrency(project.project_value)}` : ''}${project.amount_paid ? `
- Valor Pago: ${formatCurrency(project.amount_paid)}` : ''}${project.amount_pending ? `
- Valor Pendente: ${formatCurrency(project.amount_pending)}` : ''}

`;
    });

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━

📋 SUAS TAREFAS:

`;

    // Lista de todas as tarefas do usuário
    userTasks.forEach((task, index) => {
      const project = projects.find(p => p.id === task.project_id);
      const isUpcoming = upcomingTasks.some(t => t.id === task.id);
      const statusEmoji = task.status === 'CONCLUIDA' ? '✓' : task.status === 'EM_ANDAMENTO' ? '🔄' : '⏳';

      // Obter co-responsáveis (excluindo o usuário atual)
      let coResponsible = '';
      if (Array.isArray(task.assigned_to)) {
        const otherResponsibles = task.assigned_to.filter(id => id !== reportUserId);
        if (otherResponsibles.length > 0) {
          coResponsible = `👥 Co-responsável: ${getResponsibleNames(otherResponsibles)}`;
        }
      }

      report += `✅ TAREFA ${index + 1}
📌 Título: ${task.title}
🏗️ Projeto: ${project?.name || 'Projeto não encontrado'}${coResponsible ? '\n' + coResponsible : ''}
📊 Fase: ${task.phase || '-'}
🔄 Status: ${task.status}${task.status === 'CONCLUIDA' ? ' ✓' : ''}
🏆 Pontos: ${task.points || 0} pontos
⚡ Prioridade: ${task.priority === 'alta' ? 'Alta' : task.priority === 'media' ? 'Média' : 'Baixa'}
📅 Início: ${formatDate(task.activity_start)}
⏰ Prazo: ${formatDate(task.due_date)}${isUpcoming ? ' ⚠️ PRÓXIMO' : ''}
📝 Entrega Realizada: ${formatDate(task.completed_at)}${task.status === 'CONCLUIDA' ? ' ✓' : ''}
🔒 Restrições: ${task.restricoes || '-'}
💬 Comentário: ${task.comment || '-'}

━━━━━━━━━━━━━━━━━━━━━

`;
    });

    // Resumo final
    const upcomingTaskName = upcomingTasks.length > 0 ? upcomingTasks[0].title : '';
    const upcomingTaskDate = upcomingTasks.length > 0 ? formatDate(upcomingTasks[0].due_date) : '';

    // Calcular pontos totais
    const totalPoints = userTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const completedPoints = completedUserTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const pendingPoints = pendingUserTasks.reduce((sum, task) => sum + (task.points || 0), 0);

    report += `📊 RESUMO:
- Total de Tarefas: ${userTasks.length}
- Concluídas: ${completedUserTasks.length} ✓
- Pendentes: ${pendingUserTasks.length}${upcomingTasks.length > 0 ? `
- Próxima: ${upcomingTaskName} para ${upcomingTaskDate}` : ''}

🏆 PONTUAÇÃO:
- Pontos Totais Disponíveis: ${totalPoints}
- Pontos Conquistados: ${completedPoints} ✓
- Pontos Pendentes: ${pendingPoints}
- Taxa de Conquista: ${totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%

Qualquer dúvida, estou à disposição!`;

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

  // Função para gerar cronograma de projetos
  const generateProjectTimeline = () => {
    const reportUserId = isAdmin && selectedUserId ? selectedUserId : user?.id || '';
    const reportUser = isAdmin && selectedUserId ? currentUser : user;
    const userTasks = getTasksByUser(reportUserId);

    // Agrupar tarefas por mês
    const tasksByMonth = userTasks.reduce((acc: { [key: string]: any[] }, task: any) => {
      if (!task.due_date) return acc;

      const date = new Date(task.due_date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(task);

      return acc;
    }, {} as { [key: string]: any[] });

    let timeline = `📅 CRONOGRAMA DE PROJETOS - ${(reportUser?.full_name || reportUser?.email || 'USUÁRIO').toUpperCase()}
📅 Data: ${getCurrentDate()}
━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CRONOGRAMA DE PRAZOS:

`;

    Object.entries(tasksByMonth).forEach(([month, monthTasks]: [string, any[]]) => {
      timeline += `📅 ${month.toUpperCase()}
`;

      monthTasks
        .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .forEach((task, index) => {
          const project = projects.find(p => p.id === task.project_id);
          const statusIcon = task.status === 'CONCLUIDA' ? '✅' : task.status === 'EM_ANDAMENTO' ? '🔄' : '⏳';

          timeline += `  ${statusIcon} ${formatDate(task.due_date)} - ${task.title}
      🏗️ ${project?.name || 'Projeto não encontrado'}
      📊 ${task.phase || '-'} | Status: ${task.status}

`;
        });

      timeline += `━━━━━━━━━━━━━━━━━━━━━

`;
    });

    return timeline;
  };

  // Função para gerar relatório de desempenho do projetista
  const generatePerformanceReport = () => {
    const reportUserId = isAdmin && selectedUserId ? selectedUserId : user?.id || '';
    const reportUser = isAdmin && selectedUserId ? currentUser : user;
    const userTasks = getTasksByUser(reportUserId);
    const completedTasks = userTasks.filter(t => t.status === 'CONCLUIDA');

    let performance = `📊 DESEMPENHO DO PROJETISTA - ${(reportUser?.full_name || reportUser?.email || 'USUÁRIO').toUpperCase()}
📅 Data: ${getCurrentDate()}
━━━━━━━━━━━━━━━━━━━━━━━━━

📋 HISTÓRICO DE ENTREGAS:

`;

    completedTasks.forEach((task, index) => {
      if (!task.due_date || !task.completed_at) return;

      const project = projects.find(p => p.id === task.project_id);
      const dueDate = new Date(task.due_date);
      const completedDate = new Date(task.completed_at);
      const daysDiff = Math.floor((dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

      let points = 0;
      let status = '';
      if (daysDiff > 0) {
        points = daysDiff * 2;
        status = `📈 ANTECIPADO (+${daysDiff} dias) = +${points} pontos`;
      } else if (daysDiff < 0) {
        points = daysDiff * 4; // será negativo
        status = `📉 ATRASADO (${Math.abs(daysDiff)} dias) = ${points} pontos`;
      } else {
        points = 0;
        status = `🎯 NO PRAZO = 0 pontos`;
      }

      performance += `✅ ENTREGA ${index + 1}
📌 ${task.title}
🏗️ Projeto: ${project?.name || 'Projeto não encontrado'}
📊 Fase: ${task.phase || '-'}
⏰ Prazo: ${formatDate(task.due_date)}
📝 Entregue: ${formatDate(task.completed_at)}
${status}

━━━━━━━━━━━━━━━━━━━━━

`;
    });

    // Calcular pontuação total
    const totalPoints = completedTasks.reduce((sum, task) => {
      if (!task.due_date || !task.completed_at) return sum;
      const daysDiff = Math.floor((new Date(task.due_date).getTime() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) return sum + (daysDiff * 2);
      else if (daysDiff < 0) return sum + (daysDiff * 4);
      else return sum;
    }, 0);

    performance += `📊 RESUMO DO DESEMPENHO:
- Total de Entregas: ${completedTasks.length}
- Pontuação Total: ${totalPoints} pontos
- Média por Entrega: ${completedTasks.length > 0 ? Math.round(totalPoints / completedTasks.length) : 0} pontos
- Entregas Antecipadas: ${completedTasks.filter(t => {
  if (!t.due_date || !t.completed_at) return false;
  return new Date(t.due_date) > new Date(t.completed_at);
}).length}
- Entregas no Prazo: ${completedTasks.filter(t => {
  if (!t.due_date || !t.completed_at) return false;
  const diff = Math.floor((new Date(t.due_date).getTime() - new Date(t.completed_at).getTime()) / (1000 * 60 * 60 * 24));
  return diff === 0;
}).length}
- Entregas Atrasadas: ${completedTasks.filter(t => {
  if (!t.due_date || !t.completed_at) return false;
  return new Date(t.due_date) < new Date(t.completed_at);
}).length}

Sistema: +2 pontos por dia antecipado, -4 pontos por dia de atraso`;

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
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análise e relatórios do sistema de gestão</p>
          </div>
          
          {/* Filtro para Administradores */}
          {isAdmin && (
            <div className="flex items-center space-x-4">
              <Label htmlFor="user-select">Filtrar por usuário:</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-[200px]" id="user-select">
                  <SelectValue placeholder="Seus próprios dados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Seus próprios dados</SelectItem>
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
      </motion.div>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {activeTasks} em andamento • {completedTasks} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Performance geral
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
              Desempenho do Projetista
            </CardTitle>
            <CardDescription>Histórico de entregas, prazos e pontuação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Análise</Label>
              <p className="text-sm text-muted-foreground">
                Relatório completo do seu desempenho individual
              </p>
            </div>
            <Button className="w-full" onClick={handleShowPerformance}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-success" />
              Cronograma de Projetos
            </CardTitle>
            <CardDescription>Timeline de prazos no calendário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timeline</Label>
              <p className="text-sm text-muted-foreground">
                Visualize todos os seus prazos organizados por mês
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
              Relatório de Tarefas
            </CardTitle>
            <CardDescription>Análise completa das atividades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concluidas">Tarefas Concluídas</SelectItem>
                  <SelectItem value="pendentes">Tarefas Pendentes</SelectItem>
                  <SelectItem value="completo">Relatório Completo</SelectItem>
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
                {showReport && 'Relatório de Tarefas'}
                {showTimeline && 'Cronograma de Projetos'}
                {showPerformance && 'Desempenho do Projetista'}
              </h3>
              <div className="flex gap-2">
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
                  Relatório gerado em {new Date().toLocaleString('pt-BR')}
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