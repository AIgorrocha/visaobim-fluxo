import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopDesignersChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

const formatCurrency = (value: number) => {
  if (value >= 1000) {
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

export function TopDesignersChart({ data }: TopDesignersChartProps) {
  const chartData = data
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(item => ({
      name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
      fullName: item.name,
      value: item.total
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top 5 Projetistas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-sm">Sem pagamentos registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top 5 Projetistas (por valor pago)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => formatTooltip(value)}
              labelFormatter={(_, payload) => payload[0]?.payload?.fullName || ''}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
