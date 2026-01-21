import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CashFlowChartProps {
  received: number;
  paidDesigners: number;
  expenses: number;
  balance: number;
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
  }).format(Math.abs(value));
};

export function CashFlowChart({ received, paidDesigners, expenses, balance }: CashFlowChartProps) {
  const data = [
    { name: 'Recebido', value: received, color: '#22c55e', type: 'positive' },
    { name: 'Projetistas', value: -paidDesigners, color: '#ef4444', type: 'negative' },
    { name: 'Despesas', value: -expenses, color: '#f59e0b', type: 'negative' },
    { name: 'Saldo', value: balance, color: balance >= 0 ? '#3b82f6' : '#dc2626', type: 'result' }
  ];

  const hasData = received > 0 || paidDesigners > 0 || expenses > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-sm">Sem movimentações</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ left: 10, right: 10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const type = props.payload.type;
                const prefix = type === 'negative' ? '- ' : type === 'positive' ? '+ ' : '';
                return [prefix + formatTooltip(value), ''];
              }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" /> Entrada
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" /> Saída
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" /> Resultado
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
