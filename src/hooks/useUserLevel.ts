import { useMemo } from 'react';

interface LevelInfo {
  level: number;
  currentPoints: number;
  nextLevelPoints: number;
  progress: number;
  pointsToNext: number;
}

const LEVEL_RANGES = [
  { level: 1, minPoints: 0, maxPoints: 99 },
  { level: 2, minPoints: 100, maxPoints: 299 },
  { level: 3, minPoints: 300, maxPoints: 599 },
  { level: 4, minPoints: 600, maxPoints: 999 },
  { level: 5, minPoints: 1000, maxPoints: 1499 },
  { level: 6, minPoints: 1500, maxPoints: 2499 },
  { level: 7, minPoints: 2500, maxPoints: 3999 },
  { level: 8, minPoints: 4000, maxPoints: 5999 },
  { level: 9, minPoints: 6000, maxPoints: 9999 },
  { level: 10, minPoints: 10000, maxPoints: Infinity }
];

export const useUserLevel = (points: number): LevelInfo => {
  return useMemo(() => {
    const currentLevelInfo = LEVEL_RANGES.find(
      range => points >= range.minPoints && points <= range.maxPoints
    ) || LEVEL_RANGES[0];

    const currentLevel = currentLevelInfo.level;
    const currentLevelMin = currentLevelInfo.minPoints;
    const nextLevelMin = currentLevel === 10 ? Infinity : LEVEL_RANGES[currentLevel].minPoints;

    const pointsInCurrentLevel = points - currentLevelMin;
    const pointsNeededForLevel = nextLevelMin === Infinity ? 0 : nextLevelMin - currentLevelMin;
    const progress = nextLevelMin === Infinity ? 100 : (pointsInCurrentLevel / pointsNeededForLevel) * 100;
    const pointsToNext = nextLevelMin === Infinity ? 0 : nextLevelMin - points;

    return {
      level: currentLevel,
      currentPoints: points,
      nextLevelPoints: nextLevelMin,
      progress: Math.min(progress, 100),
      pointsToNext: Math.max(pointsToNext, 0)
    };
  }, [points]);
};

export const getLevelName = (level: number): string => {
  const levelNames = {
    1: 'Iniciante',
    2: 'Aprendiz',
    3: 'Desenvolvedor',
    4: 'Profissional',
    5: 'Especialista',
    6: 'Sênior',
    7: 'Expert',
    8: 'Mestre',
    9: 'Lendário',
    10: 'Supremo'
  };

  return levelNames[level as keyof typeof levelNames] || 'Desconhecido';
};

export const getLevelColor = (level: number): string => {
  if (level <= 2) return 'text-gray-600';
  if (level <= 4) return 'text-blue-600';
  if (level <= 6) return 'text-green-600';
  if (level <= 8) return 'text-purple-600';
  return 'text-yellow-600';
};