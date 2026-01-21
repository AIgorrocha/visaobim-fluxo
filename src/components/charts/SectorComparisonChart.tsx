import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectorComparisonChartProps {
  publicData: {
    contractValue: number;
    received: number;
    expenses: number;
    profit: number;
  };
  privateData: {
    contractValue: number;
    received: number;
    expenses: number;
    profit: number;
  };
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
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

export function SectorComparisonChart({ publicData, privateData }: SectorComparisonChartProps) {
  const data = [
    {
      name: 'Valor Contrato',
      Publico: publicData.contractValue,
      Privado: privateData.contractValue
    },
    {
      name: 'Recebido',
      Publico: publicData.received,
      Privado: privateData.received
    },
    {
      name: 'Despesas',
      Publico: publicData.expenses,
      Privado: privateData.expenses
    },
    {
      name: 'Lucro',
      Publico: publicData.profit,
      Privado: privateData.profit
    }
  ];

  const hasData = publicData.contractValue > 0 || privateData.contractValue > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Público vs Privado</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm">Sem dados para comparação</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Público vs Privado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => formatTooltip(value)}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Bar dataKey="Publico" name="Público" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Privado" name="Privado" fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
