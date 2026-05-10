import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UnmappedLancamento {
  tabela: string;
  id: string;
  appsheet_id: string | null;
  data: string;
  amount: number;
  description: string;
  contract_name: string | null;
  sector: string | null;
  project_id: string | null;
}

export function useUnmappedLancamentos() {
  const [items, setItems] = useState<UnmappedLancamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('v_unmapped_lancamentos') as any).select('*').order('data', { ascending: false });
    if (!error) setItems((data || []).map((r: any) => ({ ...r, amount: Number(r.amount) })));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, refetch: fetch };
}
