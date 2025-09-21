import { motion } from 'framer-motion';
import { Trophy, Star, Award, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const achievements = [
  { id: '1', title: 'Primeira Tarefa', description: 'Complete sua primeira tarefa', icon: Target, unlocked: true, points: 10 },
  { id: '2', title: 'Velocidade Máxima', description: 'Complete 5 tarefas em um dia', icon: Star, unlocked: true, points: 50 },
  { id: '3', title: 'Perfeccionista', description: 'Complete 10 tarefas sem atrasos', icon: Award, unlocked: false, points: 75 },
  { id: '4', title: 'Trabalho em Equipe', description: 'Ajude 5 colegas', icon: Trophy, unlocked: false, points: 30 }
];

const Conquistas = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getLevelProgress = (points: number, level: number) => {
    const levelRanges = [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
    const currentLevelMin = level === 1 ? 0 : levelRanges[level - 2];
    const nextLevelMin = levelRanges[level - 1] || 10000;
    const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Central de Conquistas</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e conquistas</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Nível {user.level}
            </CardTitle>
            <CardDescription>{user.points} pontos</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getLevelProgress(user.points, user.level)} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Continue ganhando pontos para subir de nível!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sua posição:</span>
                <Badge variant="secondary">3º lugar</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pontos totais:</span>
                <span className="font-medium">{user.points}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conquistas Desbloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.filter(a => a.unlocked).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg"
                >
                  <achievement.icon className="h-8 w-8 text-success" />
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    +{achievement.points}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.filter(a => !a.unlocked).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg opacity-60"
                >
                  <achievement.icon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="outline">
                    {achievement.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Conquistas;