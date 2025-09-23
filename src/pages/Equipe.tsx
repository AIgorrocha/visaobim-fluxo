import { motion } from 'framer-motion';
import { Trophy, Users, Target, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { calculateUserPoints, getUserLevel } from '@/utils/scoring';
import { useUserData } from '@/hooks/useUserData';

// Team data is now loaded dynamically from profiles

const Equipe = () => {
  const { user } = useAuth();
  const { profiles, tasks } = useSupabaseData();
  const { getUserProjects, getUserTasks } = useUserData();

  // Incluir dados de pontuação real dos profiles (usar dados do banco)
  const teamWithStats = profiles
    .filter(profile => profile.id !== user?.id)
    .map(member => {
      const memberTasks = getUserTasks(member.id);
      const memberProjects = getUserProjects(member.id);
      const completedTasks = memberTasks.filter(t => t.status === 'CONCLUIDA');

      return {
        ...member,
        tasks: memberTasks.length,
        projects: memberProjects.length,
        completedTasks: completedTasks.length,
        activeTasks: memberTasks.filter(t => t.status === 'EM_ANDAMENTO').length,
        // Usar pontos reais do banco de dados atualizados pela migração
        points: member.points || 0,
        level: member.level || 1
      };
    });

  const sortedTeam = teamWithStats.sort((a, b) => b.points - a.points);

  // Estatísticas gerais
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'CONCLUIDA').length;
  const totalPoints = teamWithStats.reduce((sum, member) => sum + member.points, 0);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Equipe</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Acompanhe o desempenho da equipe
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Membros Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamWithStats.length}</div>
            <p className="text-xs text-muted-foreground">Total da equipe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-success" />
              Tarefas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">de {totalTasks} tarefas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Total de Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pontuação geral</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeam.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2 md:space-x-4 p-3 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs md:text-sm">
                  {index + 1}
                </div>
                <Avatar>
                  <AvatarFallback>{(member.full_name || member.email)[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">{member.full_name || member.email}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {member.tasks} tarefas ({member.completedTasks} concluídas) • {member.projects} projetos
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">{member.points} pontos</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Nível {member.level}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Equipe;