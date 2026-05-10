import { useMemo } from 'react';
import { useFinancialMetrics } from './useFinancialMetrics';
import { useFinancialDRE } from './useFinancialDRE';

export interface AppAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  title: string;
  message: string;
  metricValue?: number;
  threshold?: number;
}

const SIMPLES_TETO = 4_800_000;
const SIMPLES_WARNING = 4_320_000; // 90%
const SIMPLES_INFO = 3_840_000;    // 80%

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function useFinancialAlerts() {
  const { kpis, monthlyFlow, medicoesPrevistas } = useFinancialMetrics('all');
  const { rolling12mReceita, dreMonthly } = useFinancialDRE('all');

  const alerts = useMemo<AppAlert[]>(() => {
    const out: AppAlert[] = [];

    // 1. Teto Simples Nacional
    if (rolling12mReceita >= SIMPLES_TETO) {
      out.push({
        id: 'simples-teto',
        severity: 'critical',
        type: 'simples_ceiling',
        title: '🚨 TETO SIMPLES NACIONAL ESTOURADO',
        message: `Faturamento 12m = ${fmtBRL(rolling12mReceita)}. Empresa será desenquadrada retroativamente. Contato URGENTE com contadora.`,
        metricValue: rolling12mReceita,
        threshold: SIMPLES_TETO
      });
    } else if (rolling12mReceita >= SIMPLES_WARNING) {
      out.push({
        id: 'simples-warning',
        severity: 'warning',
        type: 'simples_ceiling',
        title: '⚠️ Próximo do teto Simples Nacional',
        message: `Faturamento 12m = ${fmtBRL(rolling12mReceita)} (${((rolling12mReceita/SIMPLES_TETO)*100).toFixed(1)}% do teto R$ 4,8M). Planejar transição para Lucro Presumido.`,
        metricValue: rolling12mReceita,
        threshold: SIMPLES_TETO
      });
    } else if (rolling12mReceita >= SIMPLES_INFO) {
      out.push({
        id: 'simples-info',
        severity: 'info',
        type: 'simples_ceiling',
        title: 'Faturamento atingiu 80% do teto Simples',
        message: `12m = ${fmtBRL(rolling12mReceita)}. Monitorar. Sublimite ICMS/ISS R$ 3,6M também.`,
        metricValue: rolling12mReceita,
        threshold: SIMPLES_TETO
      });
    }

    // 2. Caixa baixo
    if (kpis.runwayMeses !== null && kpis.runwayMeses > 0 && kpis.runwayMeses < 3) {
      out.push({
        id: 'runway-baixo',
        severity: kpis.runwayMeses < 1.5 ? 'critical' : 'warning',
        type: 'low_runway',
        title: '🔴 Runway crítico',
        message: `Caixa cobre apenas ${kpis.runwayMeses.toFixed(1)} meses no ritmo atual. Revisar despesas ou acelerar recebíveis.`,
        metricValue: kpis.runwayMeses
      });
    }

    // 3. Cobertura fixos abaixo de 100%
    if (kpis.coberturaFixos < 1 && kpis.custoFixoMensalMedio > 0) {
      out.push({
        id: 'cobertura-fixos',
        severity: kpis.coberturaFixos < 0.7 ? 'critical' : 'warning',
        type: 'fixed_coverage',
        title: 'Receita não cobre custos fixos',
        message: `Receita média 3m = ${fmtBRL(kpis.receitaMediaUlt3m)} vs Fixos = ${fmtBRL(kpis.custoFixoMensalMedio)}. Gap = ${fmtBRL(kpis.custoFixoMensalMedio - kpis.receitaMediaUlt3m)}/mês.`,
        metricValue: kpis.coberturaFixos
      });
    }

    // 4. Medições atrasadas (cobrança)
    const atrasadas = medicoesPrevistas.filter(m => m.days_until !== null && m.days_until < 0);
    if (atrasadas.length > 0) {
      const total = atrasadas.reduce((s, m) => s + m.amount, 0);
      out.push({
        id: 'medicoes-atrasadas',
        severity: 'warning',
        type: 'overdue_ar',
        title: `${atrasadas.length} medições previstas atrasadas`,
        message: `${fmtBRL(total)} deveriam ter entrado e não entraram. Revisar bloqueios em /medicoes-previstas.`,
        metricValue: total
      });
    }

    // 5. Burn rate alto vs receita
    if (kpis.burnRate > 0 && kpis.receitaMediaUlt3m > 0 && kpis.burnRate > kpis.receitaMediaUlt3m * 0.3) {
      out.push({
        id: 'burn-alto',
        severity: 'warning',
        type: 'high_burn',
        title: 'Burn rate elevado',
        message: `Empresa queima ${fmtBRL(kpis.burnRate)}/mês — ${((kpis.burnRate/kpis.receitaMediaUlt3m)*100).toFixed(0)}% da receita média. Sustentabilidade em risco.`,
        metricValue: kpis.burnRate
      });
    }

    // 6. EBITDA negativo último mês
    if (dreMonthly.length > 0) {
      const last = dreMonthly[dreMonthly.length - 1];
      if (last.ebitda < 0) {
        out.push({
          id: 'ebitda-negativo',
          severity: 'warning',
          type: 'negative_ebitda',
          title: `EBITDA negativo em ${last.monthLabel}`,
          message: `Operação consumiu caixa: EBITDA = ${fmtBRL(last.ebitda)}. Receita ${fmtBRL(last.receita)} insuficiente para custos+despesas.`,
          metricValue: last.ebitda
        });
      }
    }

    // 7. Variação MoM significativa receita
    if (dreMonthly.length >= 2) {
      const last = dreMonthly[dreMonthly.length - 1];
      const prev = dreMonthly[dreMonthly.length - 2];
      if (prev.receita > 0) {
        const var_ = (last.receita - prev.receita) / prev.receita;
        if (var_ < -0.3) {
          out.push({
            id: 'queda-receita',
            severity: 'warning',
            type: 'revenue_drop',
            title: `Receita caiu ${(Math.abs(var_)*100).toFixed(0)}% MoM`,
            message: `${prev.monthLabel} → ${last.monthLabel}: ${fmtBRL(prev.receita)} → ${fmtBRL(last.receita)}. Investigar causa.`,
            metricValue: var_
          });
        }
      }
    }

    return out.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [kpis, monthlyFlow, medicoesPrevistas, rolling12mReceita, dreMonthly]);

  return { alerts };
}
