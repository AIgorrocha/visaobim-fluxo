import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, TrendingUp, Star, Crown, Target, Zap, Award, Medal,
  Calendar, Clock, CheckCircle, Lock, Filter, Search, Users,
  Flame, BookOpen, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Achievement } from '@/types';

interface AchievementCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface AchievementTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  requirement: {
    type: 'tasks_completed' | 'points_earned' | 'projects_completed' | 'streak_days' | 'level_reached';
    target: number;
  };
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
}

const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'productivity',
    name: 'Produtividade',
    icon: Zap,
    color: 'text-yellow-500',
    description: 'Conquistas baseadas na execução eficiente de tarefas'
  },
  {
    id: 'collaboration',
    name: 'Colaboração',
    icon: Users,
    color: 'text-blue-500',
    description: 'Conquistas relacionadas ao trabalho em equipe'
  },
  {
    id: 'mastery',
    name: 'Maestria',
    icon: Crown,
    color: 'text-purple-500',
    description: 'Conquistas de especialização e excelência'
  },
  {
    id: 'consistency',
    name: 'Consistência',
    icon: Calendar,
    color: 'text-green-500',
    description: 'Conquistas por regularidade e dedicação'
  }
];

const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // Produtividade
  {
    id: 'first_task',
    category: 'productivity',
    title: 'Primeira Tarefa',
    description: 'Complete sua primeira tarefa',
    icon: '🎯',
    points: 10,
    requirement: { type: 'tasks_completed', target: 1 },
    rarity: 'bronze'
  },
  {
    id: 'task_master',
    category: 'productivity',
    title: 'Mestre das Tarefas',
    description: 'Complete 50 tarefas',
    icon: '⚡',
    points: 100,
    requirement: { type: 'tasks_completed', target: 50 },
    rarity: 'gold'
  },
  {
    id: 'speed_demon',
    category: 'productivity',
    title: 'Demônio da Velocidade',
    description: 'Complete 10 tarefas em um dia',
    icon: '🚀',
    points: 50,
    requirement: { type: 'tasks_completed', target: 10 },
    rarity: 'silver'
  },

  // Maestria
  {
    id: 'level_up',
    category: 'mastery',
    title: 'Subida de Nível',
    description: 'Alcance o nível 5',
    icon: '🏆',
    points: 75,
    requirement: { type: 'level_reached', target: 5 },
    rarity: 'gold'
  },
  {
    id: 'expert',
    category: 'mastery',
    title: 'Especialista',
    description: 'Alcance o nível 10',
    icon: '👑',
    points: 200,
    requirement: { type: 'level_reached', target: 10 },
    rarity: 'diamond'
  },

  // Consistência
  {
    id: 'streak_7',
    category: 'consistency',
    title: 'Dedicação Semanal',
    description: 'Complete tarefas por 7 dias seguidos',
    icon: '🔥',
    points: 30,
    requirement: { type: 'streak_days', target: 7 },
    rarity: 'bronze'
  },
  {
    id: 'streak_30',
    category: 'consistency',
    title: 'Compromisso Total',
    description: 'Complete tarefas por 30 dias seguidos',
    icon: '🌟',
    points: 150,
    requirement: { type: 'streak_days', target: 30 },
    rarity: 'diamond'
  },

  // Colaboração
  {
    id: 'team_player',
    category: 'collaboration',
    title: 'Jogador de Equipe',
    description: 'Participe de 5 projetos diferentes',
    icon: '🤝',
    points: 60,
    requirement: { type: 'projects_completed', target: 5 },
    rarity: 'silver'
  }
];

const Conquistas = () => {
  const { user, profile } = useAuth();
  const { profiles, achievements, tasks, projects } = useSupabaseData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('achievements');

  // Get user achievements and stats
  const userAchievements = achievements.filter((a: Achievement) => a.user_id === user?.id);
  const userTasks = tasks.filter((t: any) =>
    Array.isArray(t.assigned_to) ? t.assigned_to.includes(user?.id) : t.assigned_to === user?.id
  );
  const completedTasks = userTasks.filter((t: any) => t.status === 'CONCLUIDA');
  const userProjects = projects.filter((p: any) => p.responsible_ids?.includes(user?.id));

  // Calculate user stats
  const userStats = useMemo(() => {
    // Calcular pontos baseado nas achievements
    const totalPoints = userAchievements.reduce((sum, a) => sum + (a.points_earned || 0), 0);
    const currentLevel = Math.floor(totalPoints / 100) + 1;
    const tasksCompleted = completedTasks.length;
    const projectsParticipated = userProjects.length;

    return {
      totalPoints,
      currentLevel,
      tasksCompleted,
      projectsParticipated,
      achievementsEarned: userAchievements.length
    };
  }, [userAchievements, completedTasks, userProjects]);

  // Team ranking
  const teamRanking = useMemo(() => {
    // Calcular pontos baseado nas achievements
    return profiles
      .map((member: any) => {
        const memberAchievements = achievements.filter((a: Achievement) => a.user_id === member.id);
        const points = memberAchievements.reduce((sum: number, a: Achievement) => sum + (a.points_earned || 0), 0);
        return {
          ...member,
          points,
          level: Math.floor(points / 100) + 1,
          achievements: memberAchievements.length
        };
      })
      .sort((a, b) => b.points - a.points);
  }, [profiles, achievements]);

  const userRankPosition = teamRanking.findIndex((member: any) => member.id === user?.id) + 1;

  // Check which achievements user has earned
  const earnedAchievements = useMemo(() => {
    return ACHIEVEMENT_TEMPLATES.map(template => {
      const hasEarned = userAchievements.some((ua: Achievement) => ua.title === template.title);
      const canEarn = checkAchievementRequirement(template, userStats);

      return {
        ...template,
        earned: hasEarned,
        canEarn: canEarn && !hasEarned,
        progress: getAchievementProgress(template, userStats)
      };
    });
  }, [userAchievements, userStats]);

  function checkAchievementRequirement(template: AchievementTemplate, stats: any): boolean {
    switch (template.requirement.type) {
      case 'tasks_completed':
        return stats.tasksCompleted >= template.requirement.target;
      case 'level_reached':
        return stats.currentLevel >= template.requirement.target;
      case 'projects_completed':
        return stats.projectsParticipated >= template.requirement.target;
      case 'points_earned':
        return stats.totalPoints >= template.requirement.target;
      default:
        return false;
    }
  }

  function getAchievementProgress(template: AchievementTemplate, stats: any): number {
    switch (template.requirement.type) {
      case 'tasks_completed':
        return Math.min((stats.tasksCompleted / template.requirement.target) * 100, 100);
      case 'level_reached':
        return Math.min((stats.currentLevel / template.requirement.target) * 100, 100);
      case 'projects_completed':
        return Math.min((stats.projectsParticipated / template.requirement.target) * 100, 100);
      case 'points_earned':
        return Math.min((stats.totalPoints / template.requirement.target) * 100, 100);
      default:
        return 0;
    }
  }

  // Filter achievements
  const filteredAchievements = earnedAchievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || achievement.rarity === rarityFilter;

    return matchesSearch && matchesCategory && matchesRarity;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'border-orange-400 bg-orange-50 text-orange-700';
      case 'silver': return 'border-gray-400 bg-gray-50 text-gray-700';
      case 'gold': return 'border-yellow-400 bg-yellow-50 text-yellow-700';
      case 'diamond': return 'border-blue-400 bg-blue-50 text-blue-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-600';
    }
  };

  const getLevelProgress = (currentLevel: number, points: number) => {
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    const progressInCurrentLevel = points - pointsForCurrentLevel;
    const progressPercentage = (progressInCurrentLevel / 100) * 100;
    return Math.max(0, Math.min(100, progressPercentage));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Conquistas & Performance</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso, conquistas e posição na equipe
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.currentLevel}</p>
                      <p className="text-xs text-muted-foreground">Nível Atual</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">Pontos Totais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.achievementsEarned}</p>
                      <p className="text-xs text-muted-foreground">Conquistas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.tasksCompleted}</p>
                      <p className="text-xs text-muted-foreground">Concluídas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Level Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Progresso do Nível {userStats.currentLevel}
                </CardTitle>
                <CardDescription>
                  {userStats.totalPoints} pontos • Próximo nível em {(userStats.currentLevel * 100) - userStats.totalPoints} pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={getLevelProgress(userStats.currentLevel, userStats.totalPoints)} className="w-full h-3" />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Nível {userStats.currentLevel}</span>
                  <span>Nível {userStats.currentLevel + 1}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earnedAchievements
                    .filter(a => a.earned)
                    .slice(0, 6)
                    .map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-xs opacity-80">{achievement.description}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar conquistas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {ACHIEVEMENT_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Raridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Prata</SelectItem>
                      <SelectItem value="gold">Ouro</SelectItem>
                      <SelectItem value="diamond">Diamante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACHIEVEMENT_CATEGORIES.map((category) => {
              const categoryAchievements = filteredAchievements.filter(a => a.category === category.id);
              const earnedInCategory = categoryAchievements.filter(a => a.earned).length;

              return (
                <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <category.icon className={`h-6 w-6 ${category.color}`} />
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {earnedInCategory}/{categoryAchievements.length}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Achievements Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`h-full transition-all duration-200 hover:shadow-md ${
                      achievement.earned
                        ? `border-2 ${getRarityColor(achievement.rarity)} shadow-sm`
                        : 'opacity-60 border-dashed'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <div className={`text-2xl ${!achievement.earned ? 'grayscale opacity-50' : ''}`}>
                            {achievement.earned ? achievement.icon : '🔒'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{achievement.title}</h4>
                              {achievement.earned && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {achievement.description}
                            </p>

                            <div className="space-y-2">
                              {!achievement.earned && (
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progresso</span>
                                    <span>{Math.round(achievement.progress)}%</span>
                                  </div>
                                  <Progress value={achievement.progress} className="h-2" />
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <Badge
                                  variant={achievement.earned ? "default" : "outline"}
                                  className={achievement.earned ? getRarityColor(achievement.rarity) : ''}
                                >
                                  {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                                </Badge>
                                <Badge variant="secondary">
                                  +{achievement.points} pts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Ranking da Equipe
                </CardTitle>
                <CardDescription>
                  Sua posição: {userRankPosition}º lugar • {userStats.totalPoints} pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamRanking.map((member: any, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        member.id === user.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50 hover:bg-muted/70'
                      } transition-colors`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index < 3 ? (
                            <Medal className="h-5 w-5" />
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${member.id === user.id ? 'text-primary' : ''}`}>
                            {member.full_name || member.email}
                            {member.id === user.id && ' (Você)'}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Nível {member.level}</span>
                            <span>•</span>
                            <span>{member.achievements} conquistas</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={member.id === user.id ? 'default' : 'secondary'} className="text-sm">
                          {member.points.toLocaleString()} pts
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Conquistas;