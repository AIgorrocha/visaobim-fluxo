import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useRealtimeSync(onDataChange?: () => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !onDataChange) return;

    console.log('🔄 Setting up real-time sync for user:', user.id);

    // Use single channel for all tables to avoid multiple subscriptions
    const channel = supabase.channel(`user-${user.id}-changes`);

    // Listen to all relevant table changes in one channel
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        console.log('📡 Projects change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('📡 Tasks change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, (payload) => {
        console.log('📡 Proposals change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_restrictions' }, (payload) => {
        console.log('📡 Task restrictions change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('📡 Profiles change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, (payload) => {
        console.log('📡 Achievements change detected:', payload);
        onDataChange();
      })
      // Tabelas financeiras - agora sincronizadas em tempo real
      .on('postgres_changes', { event: '*', schema: 'public', table: 'designer_payments' }, (payload) => {
        console.log('📡 Designer payments change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_pricing' }, (payload) => {
        console.log('📡 Project pricing change detected:', payload);
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disciplines' }, (payload) => {
        console.log('📡 Disciplines change detected:', payload);
        onDataChange();
      })
      .subscribe();

    return () => {
      console.log('🔌 Unsubscribing from real-time channel');
      channel.unsubscribe();
    };
  }, [user, onDataChange]);
}