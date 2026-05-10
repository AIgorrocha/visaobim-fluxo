import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Target,
  Calendar, Wallet, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight, Clock,
  AlertCircle, FileText, Download, Bell, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, Area, AreaChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  BarChart, RadialBarChart, RadialBar, PolarAngleAxis, PieChart, Pie, Cell
} from 'recharts';
import { useFinancialMetrics, type SectorFilter } from '@/hooks/useFinancialMetrics';
import { useFinancialDRE } from '@/hooks/useFinancialDRE';
import { useFinancialAlerts } from '@/hooks/useFinancialAlerts';
import { useSectorAccess } from '@/hooks/useSectorAccess';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ADMIN_FINANCIAL_EMAILS = ['igor@visaobim.com', 'stael@visaobim.com'];

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
const fmtBRLk = (v: number) => {
  if (Math.abs(v) >= 1000000) return `R$ ${(v/1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `R$ ${(v/1000).toFixed(0)}k`;
  return fmtBRL(v);
};
const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

const COLORS = {
  publico: '#3b82f6',
  privado: '#10b981',
  receita: '#10b981',
  despesa: '#ef4444',
  saldo: '#6366f1',
  fixo: '#f59e0b',
  projetistas: '#8b5cf6'
};

interface KPIProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}
function KPICard({ title, value, subtitle, icon: Icon, trend, color = 'text-primary' }: KPIProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const Financeiro = () => {
  const { profile } = useAuth();
  const access = useSectorAccess();
  const [sector, setSector] = useState<SectorFilter>(access.defaultSector);
  // Forçar setor permitido se usuário não pode ver privado/all
  const effectiveSector: SectorFilter = access.canViewPrivado ? sector : 'publico';
  const { kpis, monthlyFlow, fixedCostsByCategory, topContratos, aging, medicoesPrevistas, loading } = useFinancialMetrics(effectiveSector);
  const { dreMonthly, dreConsolidada, dreVertical, dreHorizontal, rolling12mReceita, forecast12m, sazonalidadeMatriz } = useFinancialDRE(effectiveSector);
  const { alerts } = useFinancialAlerts();

  const isFinAdmin = ADMIN_FINANCIAL_EMAILS.includes(profile?.email?.toLowerCase() || '');

  if (!isFinAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Acesso restrito ao Dashboard Financeiro CEO.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados gauge break-even
  const breakEvenPct = kpis.breakEvenMensal > 0 ? Math.min(1, kpis.receitaMediaUlt3m / kpis.breakEvenMensal) : 0;
  const breakEvenData = [{ name: 'cobertura', value: breakEvenPct * 100, fill: breakEvenPct >= 1 ? '#10b981' : breakEvenPct >= 0.7 ? '#f59e0b' : '#ef4444' }];

  // Dados pie custos fixos por categoria
  const top6Fixos = fixedCostsByCategory.slice(0, 6);
  const fixosOutros = fixedCostsByCategory.slice(6).reduce((s, f) => s + f.total, 0);
  const fixosPieData = [
    ...top6Fixos.map(f => ({ name: f.categoria, value: f.total })),
    ...(fixosOutros > 0 ? [{ name: 'Outros', value: fixosOutros }] : [])
  ];
  const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#94a3b8'];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Visão estratégica — Visão Engenharia BIM</p>
        </div>
        {access.canViewPrivado ? (
          <ToggleGroup type="single" value={sector} onValueChange={(v) => v && setSector(v as SectorFilter)}>
            <ToggleGroupItem value="all">Tudo</ToggleGroupItem>
            <ToggleGroupItem value="publico" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">Público</ToggleGroupItem>
            <ToggleGroupItem value="privado" className="data-[state=on]:bg-emerald-500 data-[state=on]:text-white">Privado</ToggleGroupItem>
          </ToggleGroup>
        ) : (
          <Badge variant="default" className="bg-blue-500">Visão Pública</Badge>
        )}
      </motion.div>

      {loading && <Card><CardContent className="pt-6 text-center text-muted-foreground">Carregando métricas...</CardContent></Card>}

      {!loading && (
        <>
          {/* KPI Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Caixa Atual" value={fmtBRLk(kpis.caixaAtual)} icon={Wallet} color={kpis.caixaAtual >= 0 ? 'text-emerald-500' : 'text-red-500'} />
            <KPICard title="Custo Fixo Mensal Médio" value={fmtBRLk(kpis.custoFixoMensalMedio)} subtitle={`Pub ${fmtBRLk(kpis.custoFixoPublicoMensal)} · Priv ${fmtBRLk(kpis.custoFixoPrivadoMensal)}`} icon={TrendingDown} color="text-amber-500" />
            <KPICard title="Break-Even Mensal" value={fmtBRLk(kpis.breakEvenMensal)} subtitle={`Margem contrib. ${fmtPct(kpis.margemContribuicaoPct)}`} icon={Target} color="text-indigo-500" />
            <KPICard
              title="Cobertura Fixos"
              value={fmtPct(kpis.coberturaFixos)}
              subtitle={kpis.coberturaFixos >= 1 ? 'Receita cobre fixos' : 'Abaixo do necessário'}
              icon={Activity}
              trend={kpis.coberturaFixos >= 1 ? 'up' : 'down'}
              color={kpis.coberturaFixos >= 1 ? 'text-emerald-500' : 'text-red-500'}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Receita Média 3m" value={fmtBRLk(kpis.receitaMediaUlt3m)} icon={TrendingUp} color="text-emerald-500" />
            <KPICard title="Burn Rate" value={kpis.burnRate > 0 ? fmtBRLk(kpis.burnRate) + '/mês' : '—'} icon={AlertTriangle} color={kpis.burnRate > 0 ? 'text-red-500' : 'text-muted-foreground'} />
            <KPICard title="Runway" value={kpis.runwayMeses === null ? '∞' : kpis.runwayMeses < 0 ? '—' : `${kpis.runwayMeses.toFixed(1)} meses`} icon={Clock} color={kpis.runwayMeses === null || kpis.runwayMeses > 6 ? 'text-emerald-500' : 'text-amber-500'} />
            <KPICard title="Backlog Previsto" value={fmtBRLk(kpis.backlogPrevisto)} subtitle={`Pub ${fmtBRLk(kpis.backlogPublico)} · Priv ${fmtBRLk(kpis.backlogPrivado)}`} icon={Calendar} color="text-blue-500" />
          </div>

          {/* ALERTAS CRÍTICOS */}
          {alerts.filter(a => a.severity === 'critical').length > 0 && (
            <div className="space-y-2">
              {alerts.filter(a => a.severity === 'critical').slice(0, 3).map(a => (
                <Alert key={a.id} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{a.title}</AlertTitle>
                  <AlertDescription>{a.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <Tabs defaultValue="dre" className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-9 w-full">
              <TabsTrigger value="dre">DRE</TabsTrigger>
              <TabsTrigger value="fluxo">Fluxo</TabsTrigger>
              <TabsTrigger value="projecao">Projeção 12m</TabsTrigger>
              <TabsTrigger value="custos">Custos</TabsTrigger>
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
              <TabsTrigger value="medicoes">Medições</TabsTrigger>
              <TabsTrigger value="alertas">Alertas {alerts.length > 0 && <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">{alerts.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="sazonal">Sazonalidade</TabsTrigger>
              <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
            </TabsList>

            {/* TAB DRE */}
            <TabsContent value="dre" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>DRE — Demonstração de Resultado</CardTitle>
                  <CardDescription>Estrutura padrão Brasil · Acumulado · Análise vertical (% Receita)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Linha</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">% Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dreVertical.map((r, i) => (
                        <TableRow key={i} className={r.isSubtotal ? 'font-bold bg-muted/30' : ''}>
                          <TableCell className={r.isSubtotal ? 'text-base' : 'pl-6 text-sm text-muted-foreground'}>{r.linha}</TableCell>
                          <TableCell className={`text-right ${r.valor < 0 ? 'text-red-600' : r.isSubtotal && r.isPositive === false ? 'text-red-600' : r.isSubtotal ? 'text-emerald-600' : ''}`}>{fmtBRL(r.valor)}</TableCell>
                          <TableCell className={`text-right text-sm ${r.pctReceita < 0 ? 'text-red-600' : ''}`}>{fmtPct(r.pctReceita)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Margem Bruta</CardTitle></CardHeader><CardContent><div className={`text-3xl font-bold ${dreConsolidada.margemBruta >= 0.4 ? 'text-emerald-600' : 'text-amber-600'}`}>{fmtPct(dreConsolidada.margemBruta)}</div><p className="text-xs text-muted-foreground mt-1">Lucro Bruto / Receita Líquida</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">EBITDA Margem</CardTitle></CardHeader><CardContent><div className={`text-3xl font-bold ${dreConsolidada.ebitdaMargem >= 0.15 ? 'text-emerald-600' : 'text-amber-600'}`}>{fmtPct(dreConsolidada.ebitdaMargem)}</div><p className="text-xs text-muted-foreground mt-1">EBITDA = {fmtBRL(dreConsolidada.ebitda)}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Margem Líquida</CardTitle></CardHeader><CardContent><div className={`text-3xl font-bold ${dreConsolidada.margemLiquida >= 0.1 ? 'text-emerald-600' : 'text-amber-600'}`}>{fmtPct(dreConsolidada.margemLiquida)}</div><p className="text-xs text-muted-foreground mt-1">Lucro Líquido = {fmtBRL(dreConsolidada.lucroLiquido)}</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Evolução EBITDA Mensal</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={dreMonthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis tickFormatter={fmtBRLk} />
                      <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      <Legend />
                      <Bar dataKey="receita" fill="#10b981" name="Receita" />
                      <Bar dataKey="csp" fill="#8b5cf6" name="Custo Direto (Projetistas)" />
                      <Bar dataKey="despOperacional" fill="#f59e0b" name="Desp. Operacionais" />
                      <Line type="monotone" dataKey="ebitda" stroke="#ef4444" strokeWidth={3} name="EBITDA" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Análise Horizontal — Variação Mês a Mês</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Δ Receita</TableHead>
                        <TableHead className="text-right">EBITDA</TableHead>
                        <TableHead className="text-right">Δ EBITDA</TableHead>
                        <TableHead className="text-right">Margem EBITDA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dreHorizontal.slice(-12).reverse().map(m => (
                        <TableRow key={m.ym}>
                          <TableCell>{m.monthLabel}</TableCell>
                          <TableCell className="text-right">{fmtBRL(m.receita)}</TableCell>
                          <TableCell className={`text-right ${m.varReceita >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.varReceita !== 0 ? fmtPct(m.varReceita) : '—'}</TableCell>
                          <TableCell className={`text-right ${m.ebitda >= 0 ? '' : 'text-red-600'}`}>{fmtBRL(m.ebitda)}</TableCell>
                          <TableCell className={`text-right ${m.varEbitda >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{m.varEbitda !== 0 ? fmtPct(m.varEbitda) : '—'}</TableCell>
                          <TableCell className="text-right">{fmtPct(m.ebitdaMargem)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB PROJEÇÃO */}
            <TabsContent value="projecao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Projeção Fluxo de Caixa 12 Meses</CardTitle>
                  <CardDescription>Forecast baseado em média móvel últimos 3m + backlog conhecido</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={[...dreMonthly.slice(-6).map(m => ({ monthLabel: m.monthLabel, saldoAcumulado: 0, receita: m.receita, despesa: m.despOperacional + m.csp + m.impostoLucro, isProjected: false })), ...forecast12m]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis tickFormatter={fmtBRLk} />
                      <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b98144" name="Receita" />
                      <Area type="monotone" dataKey="despesa" stroke="#ef4444" fill="#ef444444" name="Despesa" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Tabela Projeção</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Receita Prevista</TableHead>
                        <TableHead className="text-right">Despesa Prevista</TableHead>
                        <TableHead className="text-right">Saldo Mês</TableHead>
                        <TableHead className="text-right">Saldo Acumulado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forecast12m.map(f => (
                        <TableRow key={f.ym}>
                          <TableCell><Badge variant="outline">{f.monthLabel} (projetado)</Badge></TableCell>
                          <TableCell className="text-right">{fmtBRL(f.receita)}</TableCell>
                          <TableCell className="text-right text-red-600">{fmtBRL(f.despesa)}</TableCell>
                          <TableCell className={`text-right ${f.saldoMes >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmtBRL(f.saldoMes)}</TableCell>
                          <TableCell className={`text-right font-semibold ${f.saldoAcumulado >= 0 ? '' : 'text-red-600'}`}>{fmtBRL(f.saldoAcumulado)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p className="text-xs text-muted-foreground mt-3">⚠️ Projeção simples baseada em média 3m. Não considera contratos novos, sazonalidade ou ajustes manuais.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB ALERTAS */}
            <TabsContent value="alertas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Alertas Automáticos</CardTitle>
                  <CardDescription>Sistema monitora teto Simples, runway, cobertura, atrasos, EBITDA</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.length === 0 && <p className="text-center text-muted-foreground py-8">✓ Nenhum alerta. Tudo dentro dos parâmetros saudáveis.</p>}
                  {alerts.map(a => (
                    <Alert key={a.id} variant={a.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        <Badge variant={a.severity === 'critical' ? 'destructive' : a.severity === 'warning' ? 'default' : 'secondary'}>
                          {a.severity}
                        </Badge>
                        {a.title}
                      </AlertTitle>
                      <AlertDescription>{a.message}</AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Faturamento 12 meses (rolling)</CardTitle><CardDescription>Monitoramento teto Simples Nacional R$ 4,8M</CardDescription></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Atual</span>
                      <span className="font-semibold">{fmtBRL(rolling12mReceita)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all ${rolling12mReceita >= 4_320_000 ? 'bg-red-500' : rolling12mReceita >= 3_840_000 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (rolling12mReceita / 4_800_000) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{fmtPct(rolling12mReceita / 4_800_000)} do teto</span>
                      <span>Teto: R$ 4,8M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB SAZONALIDADE */}
            <TabsContent value="sazonal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Heatmap de Sazonalidade</CardTitle>
                  <CardDescription>Receita por mês × ano · cor mais escura = mais dinheiro</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(sazonalidadeMatriz).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Sem dados suficientes.</p>
                  ) : (() => {
                    const allValues = Object.values(sazonalidadeMatriz).flatMap(y => Object.values(y));
                    const maxVal = Math.max(...allValues, 1);
                    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
                    const years = Object.keys(sazonalidadeMatriz).sort();
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left p-2">Ano</th>
                              {months.map(m => <th key={m} className="text-center p-2">{m}</th>)}
                              <th className="text-right p-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {years.map(y => {
                              const total = Object.values(sazonalidadeMatriz[y]).reduce((s, v) => s + v, 0);
                              return (
                                <tr key={y}>
                                  <td className="p-2 font-semibold">{y}</td>
                                  {months.map((m, i) => {
                                    const v = sazonalidadeMatriz[y][i + 1] || 0;
                                    const intensity = v / maxVal;
                                    const bg = intensity > 0 ? `rgba(16, 185, 129, ${0.1 + intensity * 0.9})` : 'transparent';
                                    return (
                                      <td key={i} className="p-2 text-center" style={{ backgroundColor: bg }}>
                                        {v > 0 ? fmtBRLk(v) : '—'}
                                      </td>
                                    );
                                  })}
                                  <td className="p-2 text-right font-semibold">{fmtBRLk(total)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Receita Mensal Histórica</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dreMonthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis tickFormatter={fmtBRLk} />
                      <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b98144" name="Receita" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB FLUXO DE CAIXA */}
            <TabsContent value="fluxo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa Mensal</CardTitle>
                  <CardDescription>Receitas realizadas × despesas + saldo acumulado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart data={monthlyFlow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis tickFormatter={fmtBRLk} />
                      <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      <Legend />
                      <Bar dataKey="receitas" fill={COLORS.receita} name="Receitas" />
                      <Bar dataKey="despesasTotais" fill={COLORS.despesa} name="Despesas" />
                      <Line type="monotone" dataKey="saldoAcumulado" stroke={COLORS.saldo} strokeWidth={3} name="Saldo Acumulado" dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Saldo Mensal (Lucro/Prejuízo)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={monthlyFlow}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis tickFormatter={fmtBRLk} />
                        <Tooltip formatter={(v: number) => fmtBRL(v)} />
                        <Bar dataKey="saldo" name="Saldo">
                          {monthlyFlow.map((m, i) => (
                            <Cell key={i} fill={m.saldo >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Receitas × Despesas Empilhadas</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={monthlyFlow}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis tickFormatter={fmtBRLk} />
                        <Tooltip formatter={(v: number) => fmtBRL(v)} />
                        <Legend />
                        <Bar dataKey="receitas" stackId="a" fill={COLORS.receita} name="Receitas" />
                        <Bar dataKey="despesasFixas" stackId="b" fill={COLORS.fixo} name="Despesas Fixas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB CUSTOS FIXOS */}
            <TabsContent value="custos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle>Custos Fixos por Categoria</CardTitle><CardDescription>Total acumulado</CardDescription></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={fixosPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={(e) => `${e.name}: ${fmtBRLk(e.value)}`}>
                          {fixosPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Custos Fixos: Público × Privado</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={fixedCostsByCategory.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={fmtBRLk} />
                        <YAxis type="category" dataKey="categoria" width={100} />
                        <Tooltip formatter={(v: number) => fmtBRL(v)} />
                        <Legend />
                        <Bar dataKey="publico" stackId="a" fill={COLORS.publico} name="Público" />
                        <Bar dataKey="privado" stackId="a" fill={COLORS.privado} name="Privado" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Detalhamento por Categoria</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Público</TableHead>
                        <TableHead className="text-right">Privado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Média Mensal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fixedCostsByCategory.map(f => (
                        <TableRow key={f.categoria}>
                          <TableCell className="font-medium">{f.categoria}</TableCell>
                          <TableCell className="text-right">{fmtBRL(f.publico)}</TableCell>
                          <TableCell className="text-right">{fmtBRL(f.privado)}</TableCell>
                          <TableCell className="text-right font-semibold">{fmtBRL(f.total)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{fmtBRL(f.mediaMensal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB CONTRATOS */}
            <TabsContent value="contratos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Contratos por Margem de Contribuição</CardTitle>
                  <CardDescription>Receita − Pagamentos diretos a projetistas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topContratos} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={fmtBRLk} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      <Legend />
                      <Bar dataKey="receita" fill={COLORS.receita} name="Receita" />
                      <Bar dataKey="custoDireto" fill={COLORS.projetistas} name="Custo Projetistas" />
                      <Bar dataKey="margemContribuicao" fill={COLORS.saldo} name="Margem" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Detalhamento</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Projetistas</TableHead>
                        <TableHead className="text-right">Margem</TableHead>
                        <TableHead className="text-right">Margem %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topContratos.map(c => (
                        <TableRow key={c.project_id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell><Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>{c.type}</Badge></TableCell>
                          <TableCell className="text-right">{fmtBRL(c.receita)}</TableCell>
                          <TableCell className="text-right">{fmtBRL(c.custoDireto)}</TableCell>
                          <TableCell className="text-right font-semibold">{fmtBRL(c.margemContribuicao)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={c.margemPct >= 0.5 ? 'default' : c.margemPct >= 0.3 ? 'secondary' : 'destructive'}>
                              {fmtPct(c.margemPct)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB MEDIÇÕES PREVISTAS */}
            <TabsContent value="medicoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aging — Medições a Receber</CardTitle>
                  <CardDescription>Distribuição por prazo de recebimento</CardDescription>
                </CardHeader>
                <CardContent>
                  {aging.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma medição prevista cadastrada. Cadastre em /medicoes-previstas.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={aging}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bucket" />
                        <YAxis tickFormatter={fmtBRLk} />
                        <Tooltip formatter={(v: number) => fmtBRL(v)} />
                        <Legend />
                        <Bar dataKey="publico" stackId="a" fill={COLORS.publico} name="Público" />
                        <Bar dataKey="privado" stackId="a" fill={COLORS.privado} name="Privado" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Lista — Mais próximas de entrar</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Previsto</TableHead>
                        <TableHead>Estágio</TableHead>
                        <TableHead>Bloqueio</TableHead>
                        <TableHead className="text-right">Dias</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicoesPrevistas.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhuma medição prevista. Cadastre em <a href="/medicoes-previstas" className="text-primary underline">Medições Previstas</a></TableCell></TableRow>
                      )}
                      {medicoesPrevistas.map(m => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.project_name}</TableCell>
                          <TableCell><Badge variant={m.type === 'publico' ? 'default' : 'secondary'}>{m.type || '—'}</Badge></TableCell>
                          <TableCell className="text-sm">{m.description}</TableCell>
                          <TableCell className="text-right">{fmtBRL(m.amount)}</TableCell>
                          <TableCell>{m.expected_date || '—'}</TableCell>
                          <TableCell><Badge variant="outline">{m.approval_stage || '—'}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{m.blocker || '—'}</TableCell>
                          <TableCell className="text-right">
                            {m.days_until !== null ? (
                              <Badge variant={m.days_until < 0 ? 'destructive' : m.days_until <= 30 ? 'default' : 'secondary'}>
                                {m.days_until < 0 ? `${Math.abs(m.days_until)}d atrasado` : `${m.days_until}d`}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB BREAK-EVEN */}
            <TabsContent value="breakeven" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cobertura Break-Even</CardTitle>
                    <CardDescription>Receita média 3m / Break-even mensal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <RadialBarChart innerRadius="60%" outerRadius="100%" data={breakEvenData} startAngle={180} endAngle={0}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} background />
                        <text x="50%" y="55%" textAnchor="middle" className="text-3xl font-bold fill-foreground">{fmtPct(breakEvenPct)}</text>
                        <text x="50%" y="68%" textAnchor="middle" className="text-xs fill-muted-foreground">{breakEvenPct >= 1 ? '✓ Cobre fixos' : 'Falta fechar gap'}</text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Decomposição</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Custo Fixo Mensal Médio</span>
                      <span className="font-semibold">{fmtBRL(kpis.custoFixoMensalMedio)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Margem de Contribuição Média</span>
                      <span className="font-semibold">{fmtPct(kpis.margemContribuicaoPct)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Break-Even Mensal Necessário</span>
                      <span className="font-bold text-lg text-indigo-600">{fmtBRL(kpis.breakEvenMensal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Receita Média Últimos 3m</span>
                      <span className={`font-semibold ${kpis.receitaMediaUlt3m >= kpis.breakEvenMensal ? 'text-emerald-600' : 'text-red-600'}`}>{fmtBRL(kpis.receitaMediaUlt3m)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Gap Mensal</span>
                      <span className={`font-bold ${kpis.receitaMediaUlt3m >= kpis.breakEvenMensal ? 'text-emerald-600' : 'text-red-600'}`}>
                        {kpis.receitaMediaUlt3m >= kpis.breakEvenMensal
                          ? '+' + fmtBRL(kpis.receitaMediaUlt3m - kpis.breakEvenMensal)
                          : '-' + fmtBRL(kpis.breakEvenMensal - kpis.receitaMediaUlt3m)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Como ler estes números</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Custo Fixo Mensal:</strong> média histórica de despesas das categorias fixas (CREA, contabilidade, portal, prolabore, impostos, software).</p>
                  <p><strong className="text-foreground">Margem de Contribuição:</strong> % que sobra após pagar projetistas. Ex: 50% = a cada R$ 1.000 recebido, R$ 500 ajudam a pagar fixos.</p>
                  <p><strong className="text-foreground">Break-Even:</strong> faturamento mensal mínimo para cobrir fixos. Calculado como Custo Fixo ÷ Margem de Contribuição.</p>
                  <p><strong className="text-foreground">Cobertura Fixos:</strong> ≥100% = saudável. &lt;100% = empresa está consumindo caixa.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Financeiro;
