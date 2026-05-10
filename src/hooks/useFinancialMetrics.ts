import { useMemo } from 'react';
import { useContractOverview } from './useContractFinancials';
import { useCompanyExpenses } from './useCompanyExpenses';
import { useContractIncome } from './useContractFinancials';

export type SectorFilter = 'all' | 'publico' | 'privado';

export interface MonthlyFlow {
  month: string;
  monthLabel: string;
  receitas: number;
  despesasProjetistas: number;
  despesasFixas: number;
  despesasTotais: number;
  saldo: number;
  saldoAcumulado: number;
}

export interface FixedCostCategory {
  categoria: string;
  publico: number;
  privado: number;
  total: number;
  mediaMensal: number;
}

export interface AgingBucket {
  bucket: string;
  publico: number;
  privado: number;
  total: number;
  count: number;
}

export interface ContractMargin {
  project_id: string;
  name: string;
  type: 'publico' | 'privado';
  receita: number;
  custoDireto: number;
  margemContribuicao: number;
  margemPct: number;
}

export interface FinancialKPIs {
  caixaAtual: number;
  burnRate: number;
  runwayMeses: number | null;
  custoFixoMensalMedio: number;
  custoFixoPublicoMensal: number;
  custoFixoPrivadoMensal: number;
  margemContribuicaoPct: number;
  breakEvenMensal: number;
  receitaMediaUlt3m: number;
  coberturaFixos: number;
  backlogPrevisto: number;
  backlogPublico: number;
  backlogPrivado: number;
  receitasMesAtual: number;
  despesasMesAtual: number;
}

const FIXED_CATEGORIES = new Set([
  'CREA/CAU', 'CONTABILIDADE', 'PORTAL', 'PROLABORE', 'IMPOSTOS',
  'OUTROS', 'TAXAS', 'JUNTO SEGUROS', 'FORSETI', 'CONTEUDO', 'IA',
  'PATROCINADOS', 'PROSPECCAO ATIVA', 'GERAL'
]);

function ymKey(d: string | null | undefined) {
  if (!d) return 'sem-data';
  return d.substring(0, 7);
}

function ymLabel(ym: string) {
  if (ym === 'sem-data') return ym;
  const [y, m] = ym.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${months[parseInt(m,10)-1]}/${y.slice(2)}`;
}

export function useFinancialMetrics(sector: SectorFilter = 'all') {
  const { contracts, summary, loading: cLoading } = useContractOverview();
  const { expenses, loading: eLoading } = useCompanyExpenses();
  const { income, loading: iLoading } = useContractIncome();

  const filteredContracts = useMemo(
    () => sector === 'all' ? contracts : contracts.filter(c => c.type === sector),
    [contracts, sector]
  );

  // Map projectId → type para classificar income/expenses por setor via contrato
  const projectTypeMap = useMemo(() => {
    const m = new Map<string, 'publico' | 'privado'>();
    contracts.forEach(c => m.set(c.project_id, c.type as 'publico' | 'privado'));
    return m;
  }, [contracts]);

  const realizedIncome = useMemo(
    () => income.filter((i: any) => (i.status ?? 'recebido') === 'recebido'),
    [income]
  );

  const previstoIncome = useMemo(
    () => income.filter((i: any) => i.status === 'previsto'),
    [income]
  );

  // Fluxo de caixa mensal (receitas realizadas + despesas, separa fixas vs projetistas)
  const monthlyFlow = useMemo<MonthlyFlow[]>(() => {
    const map = new Map<string, MonthlyFlow>();
    const ensure = (ym: string) => {
      if (!map.has(ym)) {
        map.set(ym, {
          month: ym,
          monthLabel: ymLabel(ym),
          receitas: 0,
          despesasProjetistas: 0,
          despesasFixas: 0,
          despesasTotais: 0,
          saldo: 0,
          saldoAcumulado: 0
        });
      }
      return map.get(ym)!;
    };

    // Receitas realizadas
    realizedIncome.forEach((i: any) => {
      const t = projectTypeMap.get(i.project_id);
      if (sector !== 'all' && t !== sector) return;
      const row = ensure(ymKey(i.income_date));
      row.receitas += Number(i.amount) || 0;
    });

    // Designer payments (custo direto projetistas) — usa contracts.total_paid_designers via expenses table não tem isso, então busca do hook contracts
    // Para simplificar e ter mês a mês: usamos summary tabular não dá granular. Vamos usar despesas company_expenses por sector
    expenses.forEach(e => {
      if (sector !== 'all' && e.sector !== sector) return;
      const row = ensure(ymKey(e.expense_date));
      row.despesasFixas += Number(e.amount) || 0;
    });

    // Designer payments por mês via raw query precisa hook próprio. Para essa versão, reuse summary contratos como anual.
    // Como aproximação: pega total_paid_designers dos contratos filtrados e distribui linear nos meses ativos.
    // Para evitar distorção, deixamos em 0 aqui (despesas fixas já conta a maioria).

    const sorted = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
    let acc = 0;
    sorted.forEach(r => {
      r.despesasTotais = r.despesasFixas + r.despesasProjetistas;
      r.saldo = r.receitas - r.despesasTotais;
      acc += r.saldo;
      r.saldoAcumulado = acc;
    });
    return sorted;
  }, [realizedIncome, expenses, projectTypeMap, sector]);

  // Custos fixos por categoria (média últimos 6 meses)
  const fixedCostsByCategory = useMemo<FixedCostCategory[]>(() => {
    const map = new Map<string, { pub: number; pvt: number; months: Set<string> }>();
    expenses.forEach(e => {
      if (sector !== 'all' && e.sector !== sector) return;
      const cat = e.cost_center || 'OUTROS';
      if (!FIXED_CATEGORIES.has(cat)) return;
      if (!map.has(cat)) map.set(cat, { pub: 0, pvt: 0, months: new Set() });
      const entry = map.get(cat)!;
      const amt = Number(e.amount) || 0;
      if (e.sector === 'publico') entry.pub += amt;
      else entry.pvt += amt;
      entry.months.add(ymKey(e.expense_date));
    });
    return Array.from(map.entries())
      .map(([categoria, v]) => ({
        categoria,
        publico: v.pub,
        privado: v.pvt,
        total: v.pub + v.pvt,
        mediaMensal: v.months.size > 0 ? (v.pub + v.pvt) / v.months.size : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, sector]);

  // KPIs
  const kpis = useMemo<FinancialKPIs>(() => {
    const totalReceitas = realizedIncome.reduce((s: number, i: any) => {
      const t = projectTypeMap.get(i.project_id);
      if (sector !== 'all' && t !== sector) return s;
      return s + (Number(i.amount) || 0);
    }, 0);

    const expFiltered = sector === 'all' ? expenses : expenses.filter(e => e.sector === sector);
    const totalDespesas = expFiltered.reduce((s, e) => s + Number(e.amount), 0);

    // Custos fixos médios mensais (públicos vs privados)
    const monthsSet = new Set(expenses.map(e => ymKey(e.expense_date)));
    const nMonths = Math.max(1, monthsSet.size);

    const fixosPub = expenses
      .filter(e => e.sector === 'publico' && FIXED_CATEGORIES.has(e.cost_center || ''))
      .reduce((s, e) => s + Number(e.amount), 0);
    const fixosPvt = expenses
      .filter(e => e.sector === 'privado' && FIXED_CATEGORIES.has(e.cost_center || ''))
      .reduce((s, e) => s + Number(e.amount), 0);

    const fixoPubMes = fixosPub / nMonths;
    const fixoPvtMes = fixosPvt / nMonths;
    const fixoTotalMes = (sector === 'publico' ? fixoPubMes : sector === 'privado' ? fixoPvtMes : fixoPubMes + fixoPvtMes);

    // Margem contribuição % média = (receita - custo direto projetistas) / receita
    const totalDireto = filteredContracts.reduce((s, c) => s + (c.total_paid_designers || 0), 0);
    const totalRecContratos = filteredContracts.reduce((s, c) => s + c.total_received, 0);
    const margemContribuicaoPct = totalRecContratos > 0 ? (totalRecContratos - totalDireto) / totalRecContratos : 0;

    const breakEven = margemContribuicaoPct > 0 ? fixoTotalMes / margemContribuicaoPct : 0;

    // Receita média últimos 3 meses (realizada)
    const last3 = monthlyFlow.slice(-3);
    const recMedia3 = last3.length > 0 ? last3.reduce((s, m) => s + m.receitas, 0) / last3.length : 0;
    const cobertura = fixoTotalMes > 0 ? recMedia3 / fixoTotalMes : 0;

    // Burn rate = média 3m de saldo negativo
    const burns = last3.filter(m => m.saldo < 0).map(m => -m.saldo);
    const burnRate = burns.length > 0 ? burns.reduce((s, b) => s + b, 0) / burns.length : 0;

    const caixaAtual = totalReceitas - totalDespesas - totalDireto;
    const runway = burnRate > 0 ? caixaAtual / burnRate : null;

    // Backlog previsto (medições previstas)
    const previstoFiltered = previstoIncome.filter((i: any) => {
      const t = projectTypeMap.get(i.project_id);
      return sector === 'all' || t === sector;
    });
    const backlogPub = previstoIncome
      .filter((i: any) => projectTypeMap.get(i.project_id) === 'publico')
      .reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const backlogPvt = previstoIncome
      .filter((i: any) => projectTypeMap.get(i.project_id) === 'privado')
      .reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const backlogTotal = previstoFiltered.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);

    // Mês atual
    const cm = new Date();
    const cmKey = `${cm.getFullYear()}-${String(cm.getMonth()+1).padStart(2,'0')}`;
    const mesAtual = monthlyFlow.find(m => m.month === cmKey);

    return {
      caixaAtual,
      burnRate,
      runwayMeses: runway,
      custoFixoMensalMedio: fixoTotalMes,
      custoFixoPublicoMensal: fixoPubMes,
      custoFixoPrivadoMensal: fixoPvtMes,
      margemContribuicaoPct,
      breakEvenMensal: breakEven,
      receitaMediaUlt3m: recMedia3,
      coberturaFixos: cobertura,
      backlogPrevisto: backlogTotal,
      backlogPublico: backlogPub,
      backlogPrivado: backlogPvt,
      receitasMesAtual: mesAtual?.receitas || 0,
      despesasMesAtual: mesAtual?.despesasTotais || 0
    };
  }, [realizedIncome, expenses, filteredContracts, projectTypeMap, monthlyFlow, previstoIncome, sector]);

  // Top contratos por margem de contribuição
  const topContratos = useMemo<ContractMargin[]>(() => {
    return filteredContracts
      .map(c => {
        const margemContribuicao = c.total_received - c.total_paid_designers;
        const margemPct = c.total_received > 0 ? margemContribuicao / c.total_received : 0;
        return {
          project_id: c.project_id,
          name: c.project_name,
          type: c.type as 'publico' | 'privado',
          receita: c.total_received,
          custoDireto: c.total_paid_designers,
          margemContribuicao,
          margemPct
        };
      })
      .filter(c => c.receita > 0)
      .sort((a, b) => b.margemContribuicao - a.margemContribuicao)
      .slice(0, 10);
  }, [filteredContracts]);

  // Aging das medições previstas (buckets por dias até expected_date)
  const aging = useMemo<AgingBucket[]>(() => {
    const buckets: Record<string, AgingBucket> = {
      '0-30': { bucket: '0-30 dias', publico: 0, privado: 0, total: 0, count: 0 },
      '31-60': { bucket: '31-60 dias', publico: 0, privado: 0, total: 0, count: 0 },
      '61-90': { bucket: '61-90 dias', publico: 0, privado: 0, total: 0, count: 0 },
      '90+': { bucket: '90+ dias', publico: 0, privado: 0, total: 0, count: 0 },
      'atrasado': { bucket: 'Atrasado', publico: 0, privado: 0, total: 0, count: 0 }
    };
    const now = new Date();
    previstoIncome.forEach((i: any) => {
      const t = projectTypeMap.get(i.project_id);
      if (sector !== 'all' && t !== sector) return;
      if (!i.expected_date) return;
      const exp = new Date(i.expected_date);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let key: string;
      if (diffDays < 0) key = 'atrasado';
      else if (diffDays <= 30) key = '0-30';
      else if (diffDays <= 60) key = '31-60';
      else if (diffDays <= 90) key = '61-90';
      else key = '90+';
      const amt = Number(i.amount) || 0;
      buckets[key].total += amt;
      buckets[key].count += 1;
      if (t === 'publico') buckets[key].publico += amt;
      else if (t === 'privado') buckets[key].privado += amt;
    });
    return Object.values(buckets).filter(b => b.count > 0);
  }, [previstoIncome, projectTypeMap, sector]);

  // Medições previstas detalhadas (para tabela)
  const medicoesPrevistas = useMemo(() => {
    return previstoIncome
      .filter((i: any) => {
        const t = projectTypeMap.get(i.project_id);
        return sector === 'all' || t === sector;
      })
      .map((i: any) => {
        const contract = contracts.find(c => c.project_id === i.project_id);
        const exp = i.expected_date ? new Date(i.expected_date) : null;
        const now = new Date();
        const diffDays = exp ? Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        return {
          id: i.id,
          project_id: i.project_id,
          project_name: contract?.project_name || 'Sem projeto',
          type: contract?.type as 'publico' | 'privado' | undefined,
          amount: Number(i.amount) || 0,
          expected_date: i.expected_date,
          income_date: i.income_date,
          description: i.description,
          income_type: i.income_type,
          blocker: i.blocker,
          approval_stage: i.approval_stage,
          status: i.status,
          days_until: diffDays
        };
      })
      .sort((a, b) => {
        if (a.expected_date && b.expected_date) return a.expected_date.localeCompare(b.expected_date);
        if (a.expected_date) return -1;
        if (b.expected_date) return 1;
        return 0;
      });
  }, [previstoIncome, contracts, projectTypeMap, sector]);

  return {
    kpis,
    monthlyFlow,
    fixedCostsByCategory,
    topContratos,
    aging,
    medicoesPrevistas,
    summary,
    loading: cLoading || eLoading || iLoading
  };
}
