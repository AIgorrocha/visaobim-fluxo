import React, { createContext, useContext, ReactNode } from 'react';
import { useProjects, useTasks, useProposals, useProfiles } from '@/hooks/useSupabaseData';
import { useTaskRestrictions, TaskRestriction } from '@/hooks/useTaskRestrictions';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

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

  // Achievements (placeholder - não implementado no backend ainda)
  achievements: any[];

  // Task Restrictions
  taskRestrictions: TaskRestriction[];
  taskRestrictionsLoading: boolean;
  taskRestrictionsError: string | null;
  createTaskRestriction: any;
  deleteTaskRestriction: any;
  updateTaskRestriction: any;
  refetchTaskRestrictions: any;

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
    restrictions: taskRestrictions,
    loading: taskRestrictionsLoading,
    error: taskRestrictionsError,
    createRestriction: createTaskRestriction,
    deleteRestriction: deleteTaskRestriction,
    updateRestriction: updateTaskRestriction,
    refetch: refetchTaskRestrictions
  } = useTaskRestrictions();

  // Set up real-time sync to refetch all data when changes occur
  const handleRealtimeRefetch = () => {
    console.log('🔄 Refetching all data due to real-time change');
    refetchProfiles();
    refetchProjects();
    refetchTasks();
    refetchProposals();
    refetchTaskRestrictions();
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
      refetchTaskRestrictions()
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

    // Achievements (placeholder - não implementado no backend ainda)
    achievements: [],

    // Task Restrictions
    taskRestrictions,
    taskRestrictionsLoading,
    taskRestrictionsError,
    createTaskRestriction,
    deleteTaskRestriction,
    updateTaskRestriction,
    refetchTaskRestrictions,

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