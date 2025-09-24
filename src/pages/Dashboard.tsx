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
  Bell,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAchievements } from '@/hooks/useAchievements';
import { calculateUserPoints, getUserLevel, getLevelProgress } from '@/utils/scoring';
import { useUserData } from '@/hooks/useUserData';
import { useProfileSync } from '@/hooks/useProfileSync';
import TaskActivitiesWidget from '@/components/TaskActivitiesWidget';
import { Achievement } from '@/types';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, proposals, profiles, projects } = useSupabaseData();
  const { profile } = useProfileSync(); // Usar dados sincronizados
  const { checkAndAwardAchievements } = useAchievements();
  const {
    isAdmin,
    userProjects,
    userTasks,
    totalProjects,
    activeProjects,
    completedProjects,
    pendingTasks,
    completedTasks,
    inProgressTasks,
    userPoints,
    userLevel
  } = useUserData();

  if (!user) return null;

  // Para estatísticas gerais de admin, usar todas as tarefas
  const allTasks = isAdmin ? tasks : userTasks;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Bem-vindo(a), {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}!
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Aqui está um resumo das suas atividades hoje.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Minhas Tarefas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userTasks.length}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{pendingTasks.length} pendentes</div>
                <div>{completedTasks.length} concluídas</div>
              </div>
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
              <CardTitle className="text-xs md:text-sm font-medium">Meus Projetos</CardTitle>
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
              <CardTitle className="text-xs md:text-sm font-medium">Pontuação</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.points || userPoints}</div>
              <p className="text-xs text-muted-foreground">
                Nível {profile?.level || userLevel}
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
              <CardTitle className="text-xs md:text-sm font-medium">Taxa de Conclusão</CardTitle>
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

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-lg">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="dependencies">Atividades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                    <span className="text-sm font-medium">Nível {profile?.level || userLevel}</span>
                    <Badge variant="secondary">{profile?.points || userPoints} pontos</Badge>
                  </div>
                  <Progress value={getLevelProgress(profile?.points || userPoints, profile?.level || userLevel)} className="w-full" />
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
                  {pendingTasks
                    .filter(task => task.due_date)
                    .sort((a, b) => {
                      const dateA = new Date(a.due_date).getTime();
                      const dateB = new Date(b.due_date).getTime();
                      return dateA - dateB;
                    })
                    .slice(0, 3).length > 0 ? (
                    <div className="space-y-3">
                      {pendingTasks
                        .filter(task => task.due_date)
                        .sort((a, b) => {
                          const dateA = new Date(a.due_date).getTime();
                          const dateB = new Date(b.due_date).getTime();
                          return dateA - dateB;
                        })
                        .slice(0, 3)
                        .map((task) => {
                          const daysUntil = Math.ceil(
                            (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                          );

                          let statusText = '';
                          let statusColor = '';

                          if (daysUntil < 0) {
                            statusText = `${Math.abs(daysUntil)} dias atrasado`;
                            statusColor = 'text-destructive';
                          } else if (daysUntil === 0) {
                            statusText = 'Hoje';
                            statusColor = 'text-destructive';
                          } else if (daysUntil === 1) {
                            statusText = 'Amanhã';
                            statusColor = 'text-destructive';
                          } else if (daysUntil <= 3) {
                            statusText = `${daysUntil} dias`;
                            statusColor = 'text-destructive';
                          } else if (daysUntil <= 7) {
                            statusText = `${daysUntil} dias`;
                            statusColor = 'text-warning';
                          } else {
                            statusText = `${daysUntil} dias`;
                            statusColor = 'text-muted-foreground';
                          }

                          return (
                            <div key={task.id} className="space-y-1">
                              <p className="text-sm font-medium">{task.title}</p>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                </p>
                                <p className={`text-xs ${statusColor} font-medium`}>
                                  📅 {statusText}
                                </p>
                              </div>
                            </div>
                          );
                        })}
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
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-warning" />
                    Sistema Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total de Tarefas</span>
                      <span className="text-sm font-medium">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total de Projetos</span>
                      <span className="text-sm font-medium">{projects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Usuários Ativos</span>
                      <span className="text-sm font-medium">{profiles.length}</span>
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
                      <span className="text-sm font-medium">Em desenvolvimento</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Recebido</span>
                      <span className="text-sm font-medium">Em desenvolvimento</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pendente</span>
                      <span className="text-sm font-medium">Em desenvolvimento</span>
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
                      <span className="text-sm">Pendentes</span>
                      <span className="text-sm font-medium">{proposals.filter(p => p.status === 'pendente').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Em Negociação</span>
                      <span className="text-sm font-medium">{proposals.filter(p => p.status === 'negociando').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Aprovadas</span>
                      <span className="text-sm font-medium">{proposals.filter(p => p.status === 'aprovada').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="atividades" className="space-y-6">
          <TaskActivitiesWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;