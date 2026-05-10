import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CategoriaDRE {
  dre_group: string;
  cost_center: string;
  dre_description: string | null;
  n_lancamentos: number;
  total: number;
}

const DRE_LABELS: Record<string, string> = {
  receita: 'Receita',
  csp: 'Custos Diretos (CSP)',
  desp_adm: 'Despesas Administrativas',
  desp_com: 'Despesas Comerciais',
  desp_pessoal: 'Despesas Pessoal',
  desp_tec: 'Tecnologia/Software',
  desp_fin: 'Despesas Financeiras',
  distribuicao_lucro: 'Distribuição de Lucro (Pró-labore)',
  imposto_lucro: 'Impostos sobre Lucro',
  outros: 'Outros (não classificado)'
};

export function useCategoriaDRE() {
  const [items, setItems] = useState<CategoriaDRE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase.from('v_categoria_dre') as any).select('*');
      if (!error) setItems((data || []).map((r: any) => ({ ...r, total: Number(r.total) })));
      setLoading(false);
    })();
  }, []);

  return { items, loading, dreLabels: DRE_LABELS };
}
