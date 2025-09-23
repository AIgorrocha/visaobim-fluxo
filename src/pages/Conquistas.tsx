import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { calculateUserPoints, getUserLevel, getLevelProgress } from '@/utils/scoring';
import { useUserData } from '@/hooks/useUserData';

const Conquistas = () => {
  const { user, profile } = useAuth();
  const { profiles } = useSupabaseData();
  const { userTasks, completedTasks, userPoints, userLevel } = useUserData();

  if (!user) return null;

  // Usar dados reais do banco para ranking (pontos já calculados pela migração)
  const teamRanking = profiles
    .map(member => ({
      ...member,
      points: member.points || 0,
      level: member.level || 1
    }))
    .sort((a, b) => b.points - a.points);

  const userRankPosition = teamRanking.findIndex(member => member.id === user.id) + 1;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Performance & Ranking</h1>
        <p className="text-muted-foreground">Acompanhe sua pontuação e posição na equipe</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Nível {userLevel}
            </CardTitle>
            <CardDescription>{userPoints} pontos</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getLevelProgress(userPoints, userLevel)} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Sistema: +2 pontos/dia antecipado, -4 pontos/dia atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sua Posição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ranking:</span>
                <Badge variant="secondary">{userRankPosition}º lugar</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pontos totais:</span>
                <span className="font-medium">{userPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarefas concluídas:</span>
                <span className="font-medium">{completedTasks.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking da Equipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Ranking da Equipe
          </CardTitle>
          <CardDescription>Posições baseadas em performance real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamRanking.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  member.id === user.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${member.id === user.id ? 'text-primary' : ''}`}>
                      {member.full_name || member.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nível {member.level}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={member.id === user.id ? 'default' : 'secondary'}>
                    {member.points} pts
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Conquistas;