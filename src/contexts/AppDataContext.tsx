import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Task, Proposal, Achievement } from '@/types';
import { mockProjects, mockTasks, mockProposals, mockAchievements } from '@/data/mockData';

interface AppDataContextType {
  // Data
  projects: Project[];
  tasks: Task[];
  proposals: Proposal[];
  achievements: Achievement[];

  // Actions
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addPoints: (userId: string, points: number) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteProject: (projectId: string) => void;

  // Getters
  getProjectsByUser: (userId: string) => Project[];
  getTasksByUser: (userId: string) => Task[];
  getAchievementsByUser: (userId: string) => Achievement[];

  // Loading states
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: 'crm_projects',
  TASKS: 'crm_tasks',
  PROPOSALS: 'crm_proposals',
  ACHIEVEMENTS: 'crm_achievements',
  USER_POINTS: 'crm_user_points'
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from localStorage or use mock data
  useEffect(() => {
    try {
      // Load projects
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      setProjects(storedProjects ? JSON.parse(storedProjects) : mockProjects);

      // Load tasks
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      setTasks(storedTasks ? JSON.parse(storedTasks) : mockTasks);

      // Load proposals
      const storedProposals = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      setProposals(storedProposals ? JSON.parse(storedProposals) : mockProposals);

      // Load achievements
      const storedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      setAchievements(storedAchievements ? JSON.parse(storedAchievements) : mockAchievements);

      // Load user points
      const storedUserPoints = localStorage.getItem(STORAGE_KEYS.USER_POINTS);
      setUserPoints(storedUserPoints ? JSON.parse(storedUserPoints) : {});

    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Fallback to mock data
      setProjects(mockProjects);
      setTasks(mockTasks);
      setProposals(mockProposals);
      setAchievements(mockAchievements);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  }, [projects, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
    }
  }, [proposals, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    }
  }, [achievements, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify(userPoints));
    }
  }, [userPoints, isLoading]);

  // Update task status
  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status,
            completed_at: status === 'concluida' ? new Date().toISOString() : undefined
          };

          // Add points to user when task is completed
          if (status === 'concluida' && task.status !== 'concluida') {
            addPoints(task.assigned_to, task.points);
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  // Add points to user
  const addPoints = (userId: string, points: number) => {
    setUserPoints(prev => ({
      ...prev,
      [userId]: (prev[userId] || 0) + points
    }));
  };

  // Update project
  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, ...updates, updated_at: new Date().toISOString() }
          : project
      )
    );
  };

  // Add new project
  const addProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: (projects.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  // Delete project
  const deleteProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  // Get projects by user
  const getProjectsByUser = (userId: string): Project[] => {
    return projects.filter(project => project.responsible_id === userId);
  };

  // Get tasks by user
  const getTasksByUser = (userId: string): Task[] => {
    return tasks.filter(task => task.assigned_to === userId);
  };

  // Get achievements by user
  const getAchievementsByUser = (userId: string): Achievement[] => {
    return achievements.filter(achievement => achievement.user_id === userId);
  };

  const value: AppDataContextType = {
    // Data
    projects,
    tasks,
    proposals,
    achievements,

    // Actions
    updateTaskStatus,
    addPoints,
    updateProject,
    addProject,
    deleteProject,

    // Getters
    getProjectsByUser,
    getTasksByUser,
    getAchievementsByUser,

    // Loading states
    isLoading
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};