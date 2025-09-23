import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  FolderOpen, 
  Trophy, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Users,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, tasks, getProjectsByUser, getTasksByUser } = useAppData();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const userProjects = isAdmin ? projects : getProjectsByUser(user.id);
  const userTasks = isAdmin ? tasks : getTasksByUser(user.id);
  const pendingTasks = userTasks.filter(task => task.status === 'PENDENTE');
  const completedTasks = userTasks.filter(task => task.status === 'CONCLUIDA');
  const inProgressTasks = userTasks.filter(task => task.status === 'EM_ANDAMENTO');
  const pausedTasks = userTasks.filter(task => task.status === 'PARALISADA');

  // Estatísticas gerais
  const totalProjects = isAdmin ? projects.length : userProjects.length;
  const activeProjects = userProjects.filter(p => p.status === 'EM_ANDAMENTO').length;
  const completedProjects = userProjects.filter(p => p.status === 'CONCLUIDO' || p.status === 'FINALIZADO').length;

  // Calcular pontos reais do usuário baseado nas tarefas concluídas com sistema real de pontuação
  const userCompletedTasks = userTasks.filter(t => t.status === 'CONCLUIDA');
  const userPoints = userCompletedTasks.reduce((sum, task) => {
    if (!task.due_date || !task.completed_at) return sum;

    const dueDate = new Date(task.due_date);
    const completedDate = new Date(task.completed_at);
    const daysDiff = Math.floor((dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 0) {
      // Entregue antes do prazo: +2 pontos por dia
      return sum + (daysDiff * 2);
    } else if (daysDiff < 0) {
      // Entregue com atraso: -4 pontos por dia
      return sum + (daysDiff * 4); // daysDiff já é negativo
    } else {
      // Entregue no prazo: 0 pontos
      return sum;
    }
  }, 0);

  // Calcular nível baseado nos pontos (sistema realista: 2 pontos por dia antecipado, -4 por atraso)
  const getUserLevel = (points: number) => {
    if (points < 0) return 0; // Nível 0 para pontuação negativa
    if (points < 10) return 1;
    if (points < 30) return 2;
    if (points < 60) return 3;
    if (points < 100) return 4;
    if (points < 150) return 5;
    if (points < 200) return 6;
    if (points < 300) return 7;
    if (points < 400) return 8;
    return 9;
  };

  const userLevel = getUserLevel(userPoints);

  const getLevelProgress = (points: number, level: number) => {
    const levelRanges = [10, 30, 60, 100, 150, 200, 300, 400, 500];
    const currentLevelMin = level === 0 ? -Infinity : level === 1 ? 0 : levelRanges[level - 2];
    const nextLevelMin = level === 0 ? 0 : levelRanges[level - 1] || 500;
    const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.max(0, Math.min(progress, 100));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo(a), {user.full_name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Aqui está um resumo das suas atividades hoje.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingTasks.length} pendentes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meus Projetos</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects} ativos • {completedProjects} concluídos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontuação</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userPoints}</div>
              <p className="text-xs text-muted-foreground">
                Nível {userLevel}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {completedTasks.length} de {userTasks.length} tarefas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-accent" />
                Pontuação e Nível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nível {userLevel}</span>
                <Badge variant="secondary">{userPoints} pontos</Badge>
              </div>
              <Progress value={getLevelProgress(userPoints, userLevel)} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Continue completando tarefas para subir de nível!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-primary" />
                Tarefas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userTasks.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {userTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'CONCLUIDA' ? 'bg-success' :
                        task.status === 'EM_ANDAMENTO' ? 'bg-warning' :
                        task.status === 'PARALISADA' ? 'bg-destructive' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.points} pontos • {task.priority === 'alta' ? 'Alta' : task.priority === 'media' ? 'Média' : 'Baixa'} prioridade
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-destructive" />
                Prazos Próximos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum prazo próximo</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-secondary" />
                Visão Geral da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Membros Ativos</span>
                  <span className="text-sm font-medium">14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tarefas em Andamento</span>
                  <span className="text-sm font-medium">{tasks.filter(t => t.status === 'EM_ANDAMENTO').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Projetos Ativos</span>
                  <span className="text-sm font-medium">{projects.filter(p => p.status === 'EM_ANDAMENTO').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-success" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Contratado</span>
                  <span className="text-sm font-medium">R$ 1.847.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Recebido</span>
                  <span className="text-sm font-medium">R$ 692.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pendente</span>
                  <span className="text-sm font-medium">R$ 1.155.000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-accent" />
                Propostas em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Novas</span>
                  <span className="text-sm font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Em Negociação</span>
                  <span className="text-sm font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Aprovadas (Mês)</span>
                  <span className="text-sm font-medium">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;