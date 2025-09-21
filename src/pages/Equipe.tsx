import { motion } from 'framer-motion';
import { Trophy, Users, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const mockTeamData = [
  { id: '1', name: 'Igor', role: 'admin', points: 2500, level: 6, tasks: 12, projects: 8 },
  { id: '2', name: 'Gustavo', points: 850, level: 3, tasks: 8, projects: 3 },
  { id: '4', name: 'Leonardo', points: 1200, level: 4, tasks: 10, projects: 4 },
  { id: '9', name: 'Rondinelly', points: 920, level: 3, tasks: 7, projects: 2 },
  { id: '7', name: 'Nicolas', points: 780, level: 3, tasks: 5, projects: 2 }
];

const Equipe = () => {
  const { user } = useAuth();

  const sortedTeam = mockTeamData.sort((a, b) => b.points - a.points);

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
            <div className="text-2xl font-bold">12</div>
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
            <div className="text-2xl font-bold">87</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Pontuação Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.250</div>
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
                    {member.tasks} tarefas • {member.projects} projetos
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