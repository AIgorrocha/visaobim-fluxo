import { motion } from 'framer-motion';
import {
  CheckSquare,
  FolderOpen,
  Trophy,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Activity,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useUserLevel, getLevelName } from '@/hooks/useUserLevel';

const Dashboard = () => {
  const { user } = useAuth();
  const { getProjectsByUser, getTasksByUser, projects } = useAppData();

  if (!user) return null;

  const userProjects = getProjectsByUser(user.id);
  const userTasks = getTasksByUser(user.id);
  const pendingTasks = userTasks.filter(task => task.status === 'pendente');
  const completedTasks = userTasks.filter(task => task.status === 'concluida');
  const inProgressTasks = userTasks.filter(task => task.status === 'em_progresso');
  const levelInfo = useUserLevel(user.points);

  const isAdmin = user.role === 'admin';

  // Cálculos de produtividade
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
  const projectsInProgress = userProjects.filter(p => p.status === 'Em Andamento').length;

  // Estimativa de horas
  const totalEstimatedHours = userTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
  const completedHours = completedTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);

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
              <div className="text-2xl font-bold">
                {isAdmin ? projects.length : userProjects.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Todos os projetos' : 'Sob sua responsabilidade'}
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
              <div className="text-2xl font-bold">{user.points}</div>
              <p className="text-xs text-muted-foreground">
                Nível {user.level}
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

        {/* Nova linha de cards - Métricas Avançadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsInProgress}</div>
              <p className="text-xs text-muted-foreground">
                de {userProjects.length} projetos totais
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                tarefas em andamento
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                taxa de conclusão
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Estimadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEstimatedHours}h</div>
              <p className="text-xs text-muted-foreground">
                {completedHours}h concluídas
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
                <span className="text-sm font-medium">
                  Nível {levelInfo.level} - {getLevelName(levelInfo.level)}
                </span>
                <Badge variant="secondary">{user.points} pontos</Badge>
              </div>
              <Progress value={levelInfo.progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {levelInfo.pointsToNext > 0
                  ? `Faltam ${levelInfo.pointsToNext} pontos para o próximo nível!`
                  : 'Você atingiu o nível máximo! Parabéns!'
                }
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
                        task.status === 'concluida' ? 'bg-success' :
                        task.status === 'em_progresso' ? 'bg-warning' : 'bg-muted'
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
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tarefas em Andamento</span>
                  <span className="text-sm font-medium">23</span>
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

      {/* Analytics Section - Insights Modernos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Análise de Produtividade
            </CardTitle>
            <CardDescription>
              Insights baseados no seu desempenho atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-secondary">{inProgressTasks.length}</div>
                <p className="text-xs text-muted-foreground">Tarefas Ativas</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Semanal</span>
                <span className="font-medium">{Math.min(100, completionRate + 15)}%</span>
              </div>
              <Progress value={Math.min(100, completionRate + 15)} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              {completionRate >= 80
                ? "🎉 Excelente produtividade! Continue assim!"
                : completionRate >= 60
                ? "📈 Boa produtividade, há espaço para melhorar"
                : "⚡ Foque nas tarefas prioritárias para aumentar sua eficiência"
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-accent" />
              Metas e Conquistas
            </CardTitle>
            <CardDescription>
              Acompanhe seu progresso e próximos objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Nível {levelInfo.level}</span>
                </div>
                <Badge variant="outline">{user.points} pts</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso do Nível</span>
                  <span className="font-medium">{levelInfo.progress}%</span>
                </div>
                <Progress value={levelInfo.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-bold text-green-600">{completedTasks.length}</div>
                  <div className="text-muted-foreground">Concluídas</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-bold text-blue-600">{pendingTasks.length}</div>
                  <div className="text-muted-foreground">Pendentes</div>
                </div>
              </div>
            </div>

            {levelInfo.pointsToNext > 0 && (
              <div className="text-xs text-muted-foreground p-2 bg-accent/10 rounded border">
                💡 <strong>Dica:</strong> Complete mais {Math.ceil(levelInfo.pointsToNext / 10)} tarefas para subir de nível!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;