import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpensesByCenterChartProps {
  data: {
    center: string;
    value: number;
  }[];
  total: number;
}

const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export function ExpensesByCenterChart({ data, total }: ExpensesByCenterChartProps) {
  const chartData = data
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6
    .map(item => ({
      name: item.center || 'Outros',
      value: item.value
    }));

  if (chartData.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Despesas por Centro de Custo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-sm">Sem despesas registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Despesas por Centro de Custo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
        </p>
      </CardContent>
    </Card>
  );
}
