import { motion } from 'framer-motion';
import { Trophy, Users, Target, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { calculateUserPoints, getUserLevel } from '@/utils/scoring';

// Dados reais da equipe com base no AuthContext
const teamMembersData = [
  { id: '1', name: 'Igor', role: 'admin' },
  { id: '2', name: 'Gustavo' },
  { id: '3', name: 'Bessa' },
  { id: '4', name: 'Leonardo' },
  { id: '5', name: 'Pedro' },
  { id: '6', name: 'Thiago' },
  { id: '7', name: 'Nicolas' },
  { id: '8', name: 'Eloisy' },
  { id: '9', name: 'Rondinelly' },
  { id: '10', name: 'Edilson' },
  { id: '11', name: 'Philip' },
  { id: '12', name: 'Nara' },
  { id: '13', name: 'Stael', role: 'admin' },
  { id: '14', name: 'Projetista Externo' }
];

const Equipe = () => {
  const { user } = useAuth();
  const { projects, tasks } = useAppData();

  // Calcular estatísticas reais para cada membro
  const teamWithStats = teamMembersData.map(member => {
    const memberTasks = tasks.filter(task =>
      Array.isArray(task.assigned_to)
        ? task.assigned_to.includes(member.id)
        : task.assigned_to === member.id
    );
    const memberProjects = projects.filter(project =>
      project.responsible_ids.includes(member.id)
    );

    // Calcular pontos baseados nas tarefas concluídas com sistema real de pontuação
    const completedTasks = memberTasks.filter(t => t.status === 'CONCLUIDA');
    const totalPoints = calculateUserPoints(completedTasks);

    return {
      ...member,
      tasks: memberTasks.length,
      projects: memberProjects.length,
      completedTasks: completedTasks.length,
      activeTasks: memberTasks.filter(t => t.status === 'EM_ANDAMENTO').length,
      points: totalPoints,
      level: getUserLevel(totalPoints)
    };
  });

  const sortedTeam = teamWithStats.sort((a, b) => b.points - a.points);

  // Estatísticas gerais
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'CONCLUIDA').length;
  const totalPoints = teamWithStats.reduce((sum, member) => sum + member.points, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho da equipe</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <Avatar>
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.tasks} tarefas ({member.completedTasks} concluídas) • {member.projects} projetos
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{member.points} pontos</Badge>
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