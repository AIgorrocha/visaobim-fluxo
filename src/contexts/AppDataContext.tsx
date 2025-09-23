import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Task, Achievement } from '@/types';
import { mockProjects, mockAchievements } from '@/data/mockData';
import { mockTasks } from '@/data/mockTasks';

interface AppDataContextType {
  // Projects
  projects: Project[];
  getProjectsByUser: (userId: string) => Project[];
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Tasks
  tasks: Task[];
  getTasksByUser: (userId: string) => Task[];
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Achievements
  achievements: Achievement[];
  getAchievementsByUser: (userId: string) => Achievement[];
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);

  // Project methods
  const getProjectsByUser = (userId: string) => {
    return projects.filter(project => project.responsible_ids.includes(userId));
  };

  const createProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project =>
      project.id === id
        ? { ...project, ...updates, updated_at: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // Also delete related tasks
    setTasks(prev => prev.filter(task => task.project_id !== id));
  };

  // Task methods
  const getTasksByUser = (userId: string) => {
    console.log('AppDataContext - Todas as tarefas:', tasks);
    console.log('AppDataContext - Buscando tarefas para usuário:', userId);
    const userTasks = tasks.filter(task => task.assigned_to === userId);
    console.log('AppDataContext - Tarefas encontradas:', userTasks);
    return userTasks;
  };

  const createTask = (taskData: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Achievement methods
  const getAchievementsByUser = (userId: string) => {
    return achievements.filter(achievement => achievement.user_id === userId);
  };

  const value: AppDataContextType = {
    // Projects
    projects,
    getProjectsByUser,
    createProject,
    updateProject,
    deleteProject,

    // Tasks
    tasks,
    getTasksByUser,
    createTask,
    updateTask,
    deleteTask,

    // Achievements
    achievements,
    getAchievementsByUser
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}