import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueByTypeChartProps {
  data: {
    type: string;
    value: number;
  }[];
  total: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

const TYPE_LABELS: Record<string, string> = {
  medicao: 'Medições',
  entrada: 'Entradas',
  parcela: 'Parcelas',
  outro: 'Outros'
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export function RevenueByTypeChart({ data, total }: RevenueByTypeChartProps) {
  const chartData = data.map(item => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.value
  }));

  if (chartData.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Receitas por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-sm">Sem dados de receitas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Receitas por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
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
