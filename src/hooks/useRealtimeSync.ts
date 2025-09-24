import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useRealtimeSync(onDataChange?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !onDataChange) return;

    console.log('🔄 Setting up real-time sync for user:', user.id);

    // Listen to changes in projects
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('📡 Projects change detected:', payload);
          onDataChange();
        }
      )
      .subscribe();

    // Listen to changes in tasks
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('📡 Tasks change detected:', payload);
          onDataChange();
        }
      )
      .subscribe();

    // Listen to changes in proposals
    const proposalsChannel = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals'
        },
        (payload) => {
          console.log('📡 Proposals change detected:', payload);
          onDataChange();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Unsubscribing from real-time channels');
      projectsChannel.unsubscribe();
      tasksChannel.unsubscribe();
      proposalsChannel.unsubscribe();
    };
  }, [user, onDataChange]);
}