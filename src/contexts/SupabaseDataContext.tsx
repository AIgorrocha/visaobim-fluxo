import React, { createContext, useContext, ReactNode } from 'react';
import { useProjects, useTasks, useProposals, useAchievements, useProfiles } from '@/hooks/useSupabaseData';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Achievement } from '@/types';

interface SupabaseDataContextType {
  // Profiles
  profiles: any[];
  profilesLoading: boolean;
  profilesError: string | null;
  createProfile: any;
  updateProfileData: any;
  refetchProfiles: any;

  // Projects
  projects: any[];
  projectsLoading: boolean;
  projectsError: string | null;
  createProject: any;
  updateProject: any;
  deleteProject: any;
  refetchProjects: any;

  // Tasks
  tasks: any[];
  tasksLoading: boolean;
  tasksError: string | null;
  createTask: any;
  updateTask: any;
  deleteTask: any;
  getTasksByUser: any;
  refetchTasks: any;

  // Proposals
  proposals: any[];
  proposalsLoading: boolean;
  proposalsError: string | null;
  createProposal: any;
  updateProposal: any;
  deleteProposal: any;
  refetchProposals: any;

  // Achievements
  achievements: Achievement[];
  achievementsLoading: boolean;
  achievementsError: string | null;
  createAchievement: any;
  getAchievementsByUser: any;
  refetchAchievements: any;

  // Sincronização global
  refetchAllData: () => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const {
    profiles,
    loading: profilesLoading,
    error: profilesError,
    createProfile,
    updateProfile: updateProfileData,
    refetch: refetchProfiles
  } = useProfiles();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
    refetch: refetchProjects
  } = useProjects();

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    refetch: refetchTasks
  } = useTasks();

  const {
    proposals,
    loading: proposalsLoading,
    error: proposalsError,
    createProposal,
    updateProposal,
    deleteProposal,
    refetch: refetchProposals
  } = useProposals();

  const {
    achievements,
    loading: achievementsLoading,
    error: achievementsError,
    createAchievement,
    getAchievementsByUser,
    refetch: refetchAchievements
  } = useAchievements();

  // Set up real-time sync to refetch all data when changes occur
  const handleRealtimeRefetch = () => {
    console.log('🔄 Refetching all data due to real-time change');
    refetchProfiles();
    refetchProjects();
    refetchTasks();
    refetchProposals();
    refetchAchievements();
  };

  useRealtimeSync(handleRealtimeRefetch);

  // Função para sincronizar todos os dados manualmente
  const refetchAllData = async () => {
    console.log('🔄 Sincronizando todos os dados...');
    await Promise.all([
      refetchProfiles(),
      refetchProjects(),
      refetchTasks(),
      refetchProposals(),
      refetchAchievements()
    ]);
    console.log('✅ Sincronização completa!');
  };

  const value: SupabaseDataContextType = {
    // Profiles
    profiles,
    profilesLoading,
    profilesError,
    createProfile,
    updateProfileData,
    refetchProfiles,

    // Projects
    projects,
    projectsLoading,
    projectsError,
    createProject,
    updateProject,
    deleteProject,
    refetchProjects,

    // Tasks
    tasks,
    tasksLoading,
    tasksError,
    createTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    refetchTasks,

    // Proposals
    proposals,
    proposalsLoading,
    proposalsError,
    createProposal,
    updateProposal,
    deleteProposal,
    refetchProposals,

    // Achievements
    achievements,
    achievementsLoading,
    achievementsError,
    createAchievement,
    getAchievementsByUser,
    refetchAchievements,

    // Sync
    refetchAllData
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

export function useSupabaseData() {
  const context = useContext(SupabaseDataContext);
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
}