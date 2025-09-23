import { motion } from 'framer-motion';
import { Trophy, Star, Award, Target, Zap, Clock, Building, Hammer, Calculator, Users, Crown, Medal, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';

// Definir conquistas específicas para Visão BIM
const achievementDefinitions = [
  // Conquistas de Início
  { id: 'primeira-tarefa', title: 'Primeira Entrega', description: 'Complete sua primeira tarefa no sistema', icon: Target, category: 'inicio', requiredCount: 1, points: 10 },
  { id: 'primeira-semana', title: 'Primeira Semana', description: 'Complete 3 tarefas em sua primeira semana', icon: Calendar, category: 'inicio', requiredCount: 3, points: 20 },

  // Conquistas de Performance
  { id: 'antecipacao-perfeita', title: 'Antecipação Perfeita', description: 'Entregue 3 tarefas com 5+ dias de antecedência', icon: Zap, category: 'performance', requiredCount: 3, points: 30 },
  { id: 'pontualidade-exemplar', title: 'Pontualidade Exemplar', description: 'Complete 5 tarefas exatamente no prazo', icon: Clock, category: 'performance', requiredCount: 5, points: 25 },
  { id: 'velocista', title: 'Velocista BIM', description: 'Complete 3 tarefas em um único dia', icon: Zap, category: 'performance', requiredCount: 3, points: 40 },
  { id: 'disciplinado', title: 'Disciplinado', description: 'Complete 10 tarefas consecutivas sem atraso', icon: Medal, category: 'performance', requiredCount: 10, points: 50 },

  // Conquistas Técnicas BIM
  { id: 'especialista-bim', title: 'Especialista BIM', description: 'Complete 5 tarefas de Construção Virtual', icon: Building, category: 'tecnica', requiredCount: 5, points: 35 },
  { id: 'master-compatibilizacao', title: 'Master de Compatibilização', description: 'Complete 3 tarefas de compatibilização', icon: Hammer, category: 'tecnica', requiredCount: 3, points: 45 },
  { id: 'orcamentista-expert', title: 'Orçamentista Expert', description: 'Complete 3 orçamentos executivos', icon: Calculator, category: 'tecnica', requiredCount: 3, points: 40 },

  // Conquistas de Projeto
  { id: 'celesc-champion', title: 'Celesc Champion', description: 'Complete tarefas no projeto CELESC/RS', icon: Crown, category: 'projeto', requiredCount: 1, points: 20 },
  { id: 'federal-expert', title: 'Federal Expert', description: 'Trabalhe em 2 projetos federais diferentes', icon: Building, category: 'projeto', requiredCount: 2, points: 30 },
  { id: 'alto-padrao', title: 'Alto Padrão', description: 'Complete tarefas em projetos residenciais de alto padrão', icon: Star, category: 'projeto', requiredCount: 1, points: 15 },
  { id: 'multidisciplinar', title: 'Multidisciplinar', description: 'Trabalhe em 3 fases diferentes de projeto', icon: Users, category: 'projeto', requiredCount: 3, points: 35 },

  // Conquistas de Superação
  { id: 'recuperacao-epica', title: 'Recuperação Épica', description: 'Recupere 20+ pontos após pontuação negativa', icon: Trophy, category: 'superacao', requiredCount: 20, points: 60 },
  { id: 'perfeccionista', title: 'Perfeccionista', description: 'Mantenha 50+ pontos por 30 dias', icon: Award, category: 'superacao', requiredCount: 50, points: 75 }
];

const Conquistas = () => {
  const { user } = useAuth();
  const { tasks, projects } = useAppData();

  if (!user) return null;

  // Calcular pontos reais do usuário
  const userTasks = tasks.filter(task =>
    Array.isArray(task.assigned_to)
      ? task.assigned_to.includes(user.id)
      : task.assigned_to === user.id
  );

  const userCompletedTasks = userTasks.filter(t => t.status === 'CONCLUIDA');
  const userPoints = userCompletedTasks.reduce((sum, task) => {
    if (!task.due_date || !task.completed_at) return sum;

    const dueDate = new Date(task.due_date);
    const completedDate = new Date(task.completed_at);
    const daysDiff = Math.floor((dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 0) {
      return sum + (daysDiff * 2); // +2 pontos por dia antecipado
    } else if (daysDiff < 0) {
      return sum + (daysDiff * 4); // -4 pontos por atraso
    } else {
      return sum; // 0 pontos no prazo
    }
  }, 0);

  // Calcular nível baseado nos pontos reais
  const getUserLevel = (points: number) => {
    if (points < 0) return 0;
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

  // Função para verificar conquistas desbloqueadas
  const checkAchievements = () => {
    return achievementDefinitions.map(achievement => {
      let unlocked = false;
      let progress = 0;

      switch (achievement.id) {
        case 'primeira-tarefa':
          unlocked = userCompletedTasks.length >= 1;
          progress = Math.min(userCompletedTasks.length, 1);
          break;

        case 'primeira-semana':
          unlocked = userCompletedTasks.length >= 3;
          progress = Math.min(userCompletedTasks.length, 3);
          break;

        case 'antecipacao-perfeita':
          const earlyTasks = userCompletedTasks.filter(task => {
            if (!task.due_date || !task.completed_at) return false;
            const daysDiff = Math.floor((new Date(task.due_date).getTime() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff >= 5;
          });
          unlocked = earlyTasks.length >= 3;
          progress = Math.min(earlyTasks.length, 3);
          break;

        case 'especialista-bim':
          const bimTasks = userCompletedTasks.filter(task =>
            task.title.toLowerCase().includes('construção virtual') ||
            task.title.toLowerCase().includes('construcao virtual')
          );
          unlocked = bimTasks.length >= 5;
          progress = Math.min(bimTasks.length, 5);
          break;

        case 'celesc-champion':
          const celescTasks = userCompletedTasks.filter(task => {
            const project = projects.find(p => p.id === task.project_id);
            return project?.client.includes('CELESC');
          });
          unlocked = celescTasks.length >= 1;
          progress = Math.min(celescTasks.length, 1);
          break;

        case 'federal-expert':
          const federalProjects = new Set();
          userCompletedTasks.forEach(task => {
            const project = projects.find(p => p.id === task.project_id);
            if (project?.type === 'publico') {
              federalProjects.add(project.id);
            }
          });
          unlocked = federalProjects.size >= 2;
          progress = Math.min(federalProjects.size, 2);
          break;

        default:
          unlocked = false;
          progress = 0;
      }

      return {
        ...achievement,
        unlocked,
        progress,
        progressPercent: (progress / achievement.requiredCount) * 100
      };
    });
  };

  const achievements = checkAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Calcular ranking baseado em todos os membros da equipe
  const teamMembers = [
    { id: '1', name: 'Igor' }, { id: '2', name: 'Gustavo' }, { id: '3', name: 'Bessa' },
    { id: '4', name: 'Leonardo' }, { id: '5', name: 'Pedro' }, { id: '6', name: 'Thiago' },
    { id: '7', name: 'Nicolas' }, { id: '8', name: 'Eloisy' }, { id: '9', name: 'Rondinelly' },
    { id: '10', name: 'Edilson' }, { id: '11', name: 'Philip' }, { id: '12', name: 'Nara' },
    { id: '13', name: 'Stael' }, { id: '14', name: 'Projetista Externo' }
  ];

  const teamRanking = teamMembers.map(member => {
    const memberTasks = tasks.filter(task =>
      Array.isArray(task.assigned_to)
        ? task.assigned_to.includes(member.id)
        : task.assigned_to === member.id
    );
    const memberCompletedTasks = memberTasks.filter(t => t.status === 'CONCLUIDA');
    const memberPoints = memberCompletedTasks.reduce((sum, task) => {
      if (!task.due_date || !task.completed_at) return sum;
      const daysDiff = Math.floor((new Date(task.due_date).getTime() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) return sum + (daysDiff * 2);
      else if (daysDiff < 0) return sum + (daysDiff * 4);
      else return sum;
    }, 0);
    return { ...member, points: memberPoints };
  }).sort((a, b) => b.points - a.points);

  const userRankPosition = teamRanking.findIndex(member => member.id === user.id) + 1;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Central de Conquistas</h1>
        <p className="text-muted-foreground">Sistema de gamificação baseado em performance real</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent" />
              Nível {userLevel}
            </CardTitle>
            <CardDescription>{userPoints} pontos reais</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getLevelProgress(userPoints, userLevel)} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Baseado em +2 pontos/dia antecipado, -4 pontos/dia atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sua posição:</span>
                <Badge variant="secondary">{userRankPosition}º lugar</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pontos totais:</span>
                <span className="font-medium">{userPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarefas concluídas:</span>
                <span className="font-medium">{userCompletedTasks.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-success" />
              Conquistas Desbloqueadas ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlockedAchievements.length > 0 ? (
                unlockedAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg border border-success/20"
                  >
                    <achievement.icon className="h-8 w-8 text-success" />
                    <div className="flex-1">
                      <h4 className="font-medium text-success">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-success mt-1">
                        {achievement.progress}/{achievement.requiredCount} concluído
                      </p>
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      +{achievement.points}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Complete tarefas para desbloquear conquistas!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-warning" />
              Em Progresso ({lockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  <achievement.icon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{achievement.progress}/{achievement.requiredCount}</span>
                        <span>{Math.round(achievement.progressPercent)}%</span>
                      </div>
                      <Progress value={achievement.progressPercent} className="h-2" />
                    </div>
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