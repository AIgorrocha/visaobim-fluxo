import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CrmInteraction, CrmEntityType, CrmFollowup } from '@/types';

export function useCrmInteractions(entityType?: CrmEntityType, entityId?: string) {
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    if (!entityType || !entityId) {
      setInteractions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_interactions')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      setInteractions((data || []) as CrmInteraction[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  const createInteraction = async (
    payload: Omit<CrmInteraction, 'id' | 'created_at' | 'created_by'>
  ) => {
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('crm_interactions')
      .insert([{ ...payload, created_by: u.user?.id }])
      .select()
      .single();
    if (error) throw error;
    setInteractions(prev => [data as CrmInteraction, ...prev]);

    // Sync next_contact_date no entity de origem
    if (payload.next_action_date) {
      if (payload.entity_type === 'lead') {
        await supabase
          .from('proposal_requests')
          .update({
            next_contact_date: payload.next_action_date,
            last_contact_date: new Date(payload.occurred_at).toISOString().split('T')[0],
          })
          .eq('id', payload.entity_id);
      } else if (payload.entity_type === 'proposal') {
        await supabase
          .from('proposals')
          .update({ followup_date: payload.next_action_date })
          .eq('id', payload.entity_id);
      } else if (payload.entity_type === 'project') {
        await supabase
          .from('projects')
          .update({
            crm_next_contact: payload.next_action_date,
            crm_last_contact: new Date(payload.occurred_at).toISOString().split('T')[0],
          })
          .eq('id', payload.entity_id);
      }
    }
    return data as CrmInteraction;
  };

  const deleteInteraction = async (id: string) => {
    const { error } = await supabase.from('crm_interactions').delete().eq('id', id);
    if (error) throw error;
    setInteractions(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  return { interactions, loading, error, createInteraction, deleteInteraction, refetch: fetchInteractions };
}

export function useCrmFollowups() {
  const [followups, setFollowups] = useState<CrmFollowup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_followups_today')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      setFollowups((data || []) as CrmFollowup[]);
    } catch (err: any) {
      console.error('followups fetch failed', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  return { followups, loading, refetch: fetchFollowups };
}
