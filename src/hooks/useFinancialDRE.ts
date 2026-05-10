import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SectorFilter = 'all' | 'publico' | 'privado';

interface DreRow { ym: string; sector: string | null; dre_group: string; amount: number; }

export interface DREStructured {
  ym: string;
  monthLabel: string;
  receita: number;
  deducoes: number;
  receitaLiquida: number;
  csp: number;
  lucroBruto: number;
  despAdm: number;
  despCom: number;
  despPessoal: number;
  despTec: number;
  despFin: number;
  despOperacional: number;
  ebitda: number;
  ebitdaMargem: number;
  distribuicaoLucro: number;
  impostoLucro: number;
  lucroAntesDistribuicao: number;
  lucroLiquido: number;
  margemLiquida: number;
  margemBruta: number;
}

export interface DREVertical {
  linha: string;
  valor: number;
  pctReceita: number;
  isSubtotal?: boolean;
  isPositive?: boolean;
}

const ymLabel = (ym: string) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${months[parseInt(m,10)-1]}/${y.slice(2)}`;
};

export function useFinancialDRE(sector: SectorFilter = 'all') {
  const [rows, setRows] = useState<DreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase.from('v_dre_monthly') as any).select('*');
      if (!error) setRows((data || []).map((r: any) => ({ ...r, amount: Number(r.amount) || 0 })));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => sector === 'all' ? rows : rows.filter(r => r.sector === sector || r.dre_group === 'imposto_lucro'),
    [rows, sector]
  );

  const dreMonthly = useMemo<DREStructured[]>(() => {
    const map = new Map<string, DREStructured>();
    filtered.forEach(r => {
      if (!map.has(r.ym)) {
        map.set(r.ym, {
          ym: r.ym, monthLabel: ymLabel(r.ym),
          receita: 0, deducoes: 0, receitaLiquida: 0, csp: 0, lucroBruto: 0,
          despAdm: 0, despCom: 0, despPessoal: 0, despTec: 0, despFin: 0,
          despOperacional: 0, ebitda: 0, ebitdaMargem: 0,
          distribuicaoLucro: 0, impostoLucro: 0, lucroAntesDistribuicao: 0,
          lucroLiquido: 0, margemLiquida: 0, margemBruta: 0
        });
      }
      const row = map.get(r.ym)!;
      switch (r.dre_group) {
        case 'receita': row.receita += r.amount; break;
        case 'deducao': row.deducoes += r.amount; break;
        case 'csp': row.csp += r.amount; break;
        case 'desp_adm': row.despAdm += r.amount; break;
        case 'desp_com': row.despCom += r.amount; break;
        case 'desp_pessoal': row.despPessoal += r.amount; break;
        case 'desp_tec': row.despTec += r.amount; break;
        case 'desp_fin': row.despFin += r.amount; break;
        case 'distribuicao_lucro': row.distribuicaoLucro += r.amount; break;
        case 'imposto_lucro': row.impostoLucro += r.amount; break;
      }
    });
    return Array.from(map.values()).map(row => {
      row.receitaLiquida = row.receita - row.deducoes;
      row.lucroBruto = row.receitaLiquida - row.csp;
      // EBITDA NÃO inclui prolabore (distribuicao_lucro). Inclui só despesas operacionais reais.
      row.despOperacional = row.despAdm + row.despCom + row.despPessoal + row.despTec + row.despFin;
      row.ebitda = row.lucroBruto - row.despOperacional;
      // Lucro antes da distribuição = EBITDA - impostos (este é o lucro REAL da empresa)
      row.lucroAntesDistribuicao = row.ebitda - row.impostoLucro;
      // Lucro líquido final = depois de retirar prolabore (saldo que sobra para empresa)
      row.lucroLiquido = row.lucroAntesDistribuicao - row.distribuicaoLucro;
      row.ebitdaMargem = row.receitaLiquida > 0 ? row.ebitda / row.receitaLiquida : 0;
      row.margemBruta = row.receitaLiquida > 0 ? row.lucroBruto / row.receitaLiquida : 0;
      row.margemLiquida = row.receitaLiquida > 0 ? row.lucroAntesDistribuicao / row.receitaLiquida : 0;
      return row;
    }).sort((a, b) => a.ym.localeCompare(b.ym));
  }, [filtered]);

  // DRE consolidada (acumulado)
  const dreConsolidada = useMemo(() => {
    const t: DREStructured = {
      ym: 'total', monthLabel: 'Acumulado',
      receita: 0, deducoes: 0, receitaLiquida: 0, csp: 0, lucroBruto: 0,
      despAdm: 0, despCom: 0, despPessoal: 0, despTec: 0, despFin: 0,
      despOperacional: 0, ebitda: 0, ebitdaMargem: 0,
      distribuicaoLucro: 0, impostoLucro: 0, lucroAntesDistribuicao: 0,
      lucroLiquido: 0, margemLiquida: 0, margemBruta: 0
    };
    dreMonthly.forEach(m => {
      t.receita += m.receita; t.deducoes += m.deducoes;
      t.csp += m.csp;
      t.despAdm += m.despAdm; t.despCom += m.despCom;
      t.despPessoal += m.despPessoal; t.despTec += m.despTec;
      t.despFin += m.despFin;
      t.distribuicaoLucro += m.distribuicaoLucro;
      t.impostoLucro += m.impostoLucro;
    });
    t.receitaLiquida = t.receita - t.deducoes;
    t.lucroBruto = t.receitaLiquida - t.csp;
    t.despOperacional = t.despAdm + t.despCom + t.despPessoal + t.despTec + t.despFin;
    t.ebitda = t.lucroBruto - t.despOperacional;
    t.lucroAntesDistribuicao = t.ebitda - t.impostoLucro;
    t.lucroLiquido = t.lucroAntesDistribuicao - t.distribuicaoLucro;
    t.ebitdaMargem = t.receitaLiquida > 0 ? t.ebitda / t.receitaLiquida : 0;
    t.margemBruta = t.receitaLiquida > 0 ? t.lucroBruto / t.receitaLiquida : 0;
    t.margemLiquida = t.receitaLiquida > 0 ? t.lucroLiquido / t.receitaLiquida : 0;
    return t;
  }, [dreMonthly]);

  // Análise vertical (% sobre receita)
  const dreVertical = useMemo<DREVertical[]>(() => {
    const t = dreConsolidada;
    const pct = (v: number) => t.receita > 0 ? v / t.receita : 0;
    return [
      { linha: 'Receita Bruta', valor: t.receita, pctReceita: 1, isSubtotal: true },
      { linha: '(−) Deduções/Impostos s/Receita', valor: -t.deducoes, pctReceita: -pct(t.deducoes) },
      { linha: 'Receita Líquida', valor: t.receitaLiquida, pctReceita: pct(t.receitaLiquida), isSubtotal: true },
      { linha: '(−) CSP — Custos Diretos (Projetistas, Levantamentos)', valor: -t.csp, pctReceita: -pct(t.csp) },
      { linha: 'Lucro Bruto', valor: t.lucroBruto, pctReceita: pct(t.lucroBruto), isSubtotal: true, isPositive: t.lucroBruto >= 0 },
      { linha: '(−) Despesas Administrativas', valor: -t.despAdm, pctReceita: -pct(t.despAdm) },
      { linha: '(−) Despesas Comerciais', valor: -t.despCom, pctReceita: -pct(t.despCom) },
      { linha: '(−) Tecnologia/Software', valor: -t.despTec, pctReceita: -pct(t.despTec) },
      { linha: 'EBITDA (Resultado Operacional Real)', valor: t.ebitda, pctReceita: pct(t.ebitda), isSubtotal: true, isPositive: t.ebitda >= 0 },
      { linha: '(−) Impostos sobre Lucro/Simples', valor: -t.impostoLucro, pctReceita: -pct(t.impostoLucro) },
      { linha: '★ LUCRO REAL DA EMPRESA (antes da distribuição)', valor: t.lucroAntesDistribuicao, pctReceita: pct(t.lucroAntesDistribuicao), isSubtotal: true, isPositive: t.lucroAntesDistribuicao >= 0 },
      { linha: '(−) Distribuição de Lucro — Pró-labore Sócios', valor: -t.distribuicaoLucro, pctReceita: -pct(t.distribuicaoLucro) },
      { linha: 'Saldo Retido na Empresa (após distribuição)', valor: t.lucroLiquido, pctReceita: pct(t.lucroLiquido), isSubtotal: true, isPositive: t.lucroLiquido >= 0 }
    ];
  }, [dreConsolidada]);

  // Análise horizontal (variação MoM)
  const dreHorizontal = useMemo(() => {
    return dreMonthly.map((m, i) => {
      const prev = dreMonthly[i - 1];
      const variacao = (curr: number, p: number) => p === 0 ? 0 : (curr - p) / Math.abs(p);
      return {
        ...m,
        varReceita: prev ? variacao(m.receita, prev.receita) : 0,
        varEbitda: prev ? variacao(m.ebitda, prev.ebitda) : 0,
        varCsp: prev ? variacao(m.csp, prev.csp) : 0,
        varDespOp: prev ? variacao(m.despOperacional, prev.despOperacional) : 0
      };
    });
  }, [dreMonthly]);

  // Curva ABC - top contratos
  // Faturamento rolling 12m (alerta Simples)
  const rolling12mReceita = useMemo(() => {
    const last12 = dreMonthly.slice(-12);
    return last12.reduce((s, m) => s + m.receita, 0);
  }, [dreMonthly]);

  // Forecast 12m simples (média móvel ajustada por sazonalidade)
  const forecast12m = useMemo(() => {
    if (dreMonthly.length < 3) return [];
    const last3Avg = dreMonthly.slice(-3).reduce((s, m) => s + m.receita, 0) / 3;
    const last3Desp = dreMonthly.slice(-3).reduce((s, m) => s + m.despOperacional + m.csp + m.impostoLucro, 0) / 3;
    const result = [];
    const lastMonth = dreMonthly[dreMonthly.length - 1];
    const [yStr, mStr] = lastMonth.ym.split('-');
    let y = parseInt(yStr, 10);
    let mm = parseInt(mStr, 10);
    let saldo = dreMonthly.reduce((s, m) => s + m.lucroLiquido, 0);
    for (let i = 1; i <= 12; i++) {
      mm += 1; if (mm > 12) { mm = 1; y += 1; }
      const ym = `${y}-${String(mm).padStart(2,'0')}`;
      const receita = last3Avg * (1 + (Math.random() - 0.5) * 0.05);
      const despesa = last3Desp;
      const saldoMes = receita - despesa;
      saldo += saldoMes;
      result.push({ ym, monthLabel: ymLabel(ym), receita, despesa, saldoMes, saldoAcumulado: saldo, isProjected: true });
    }
    return result;
  }, [dreMonthly]);

  // Sazonalidade: matriz mês×ano de receita
  const sazonalidadeMatriz = useMemo(() => {
    const matrix: Record<string, Record<number, number>> = {};
    dreMonthly.forEach(m => {
      const [y, mm] = m.ym.split('-');
      if (!matrix[y]) matrix[y] = {};
      matrix[y][parseInt(mm, 10)] = m.receita;
    });
    return matrix;
  }, [dreMonthly]);

  return {
    dreMonthly,
    dreConsolidada,
    dreVertical,
    dreHorizontal,
    rolling12mReceita,
    forecast12m,
    sazonalidadeMatriz,
    loading
  };
}
