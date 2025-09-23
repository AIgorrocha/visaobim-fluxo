// Sistema de pontuação e nível compartilhado
export const calculateUserPoints = (completedTasks: any[]) => {
  return completedTasks.reduce((sum, task) => {
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
};

export const getUserLevel = (points: number) => {
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

export const getLevelProgress = (points: number, level: number) => {
  const levelRanges = [10, 30, 60, 100, 150, 200, 300, 400, 500];
  const currentLevelMin = level === 0 ? -Infinity : level === 1 ? 0 : levelRanges[level - 2];
  const nextLevelMin = level === 0 ? 0 : levelRanges[level - 1] || 500;
  const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
  return Math.max(0, Math.min(progress, 100));
};