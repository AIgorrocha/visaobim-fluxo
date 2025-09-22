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
import { useUserLevel, getLevelName } from '@/hooks/useUserLevel';

const Dashboard = () => {
  // TESTE LOVABLE SYNC - Dashboard funcionando perfeitamente! 🚀
  const { user } = useAuth();
  const { getProjectsByUser, getTasksByUser, projects } = useAppData();

  if (!user) return null;

  const userProjects = getProjectsByUser(user.id);
  const userTasks = getTasksByUser(user.id);
  const pendingTasks = userTasks.filter(task => task.status === 'pendente');
  const completedTasks = userTasks.filter(task => task.status === 'concluida');
  const levelInfo = useUserLevel(user.points);

  const isAdmin = user.role === 'admin';

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
    </div>
  );
};

export default Dashboard;