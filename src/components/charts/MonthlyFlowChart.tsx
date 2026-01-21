import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyFlowChartProps {
  incomeData: { month: string; amount: number }[];
  expenseData: { month: string; amount: number }[];
  paymentsData: { month: string; amount: number }[];
}

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
};

const formatTooltip = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const MONTHS_PT: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

export function MonthlyFlowChart({ incomeData, expenseData, paymentsData }: MonthlyFlowChartProps) {
  const chartData = useMemo(() => {
    // Combinar todos os meses únicos
    const allMonths = new Set<string>();
    incomeData.forEach(d => allMonths.add(d.month));
    expenseData.forEach(d => allMonths.add(d.month));
    paymentsData.forEach(d => allMonths.add(d.month));

    // Ordenar meses
    const sortedMonths = Array.from(allMonths).sort();

    // Últimos 12 meses
    const last12 = sortedMonths.slice(-12);

    return last12.map(month => {
      const income = incomeData.find(d => d.month === month)?.amount || 0;
      const expenses = expenseData.find(d => d.month === month)?.amount || 0;
      const payments = paymentsData.find(d => d.month === month)?.amount || 0;
      const [year, monthNum] = month.split('-');
      const shortMonth = MONTHS_PT[monthNum] || monthNum;

      return {
        name: `${shortMonth}/${year.slice(-2)}`,
        fullMonth: month,
        Entradas: income,
        Projetistas: -payments,
        Despesas: -expenses,
        Saldo: income - payments - expenses
      };
    });
  }, [incomeData, expenseData, paymentsData]);

  if (chartData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Fluxo de Caixa Mensal</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground text-sm">Sem dados de movimentações</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Fluxo de Caixa Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number, name: string) => [formatTooltip(Math.abs(value)), name]}
              labelFormatter={(label) => `Período: ${label}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Projetistas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" /> Entradas
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" /> Pago Projetistas
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" /> Despesas
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
