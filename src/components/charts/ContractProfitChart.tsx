import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContractData {
  project_id: string;
  project_name: string;
  total_received: number;
  total_paid_designers: number;
  total_expenses: number;
  profit_margin: number;
  amount_to_receive: number;
  amount_to_pay_designers: number;
}

interface ContractProfitChartProps {
  contracts: ContractData[];
  onContractClick?: (projectId: string) => void;
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

const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function ContractProfitChart({ contracts, onContractClick }: ContractProfitChartProps) {
  const chartData = useMemo(() => {
    return contracts
      .filter(c => c.total_received > 0 || c.total_paid_designers > 0)
      .sort((a, b) => b.profit_margin - a.profit_margin)
      .slice(0, 15)
      .map(c => ({
        id: c.project_id,
        name: c.project_name.length > 20 ? c.project_name.substring(0, 20) + '...' : c.project_name,
        fullName: c.project_name,
        lucro: c.profit_margin,
        recebido: c.total_received,
        pago: c.total_paid_designers,
        despesas: c.total_expenses,
        aReceber: c.amount_to_receive,
        aPagar: c.amount_to_pay_designers
      }));
  }, [contracts]);

  if (chartData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Lucro por Contrato</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground text-sm">Sem contratos com movimentações</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.fullName}</p>
          <div className="space-y-1 text-xs">
            <p className="text-green-500">Recebido: {formatFullCurrency(data.recebido)}</p>
            <p className="text-red-500">Pago Projetistas: {formatFullCurrency(data.pago)}</p>
            <p className="text-amber-500">Despesas: {formatFullCurrency(data.despesas)}</p>
            <hr className="my-1 border-border" />
            <p className={data.lucro >= 0 ? 'text-emerald-500 font-semibold' : 'text-red-600 font-semibold'}>
              Lucro: {formatFullCurrency(data.lucro)}
            </p>
            <hr className="my-1 border-border" />
            <p className="text-yellow-500">A Receber: {formatFullCurrency(data.aReceber)}</p>
            <p className="text-orange-500">A Pagar: {formatFullCurrency(data.aPagar)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Lucro por Contrato (Top 15)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ left: 10, right: 40 }}
            onClick={(data) => {
              if (data?.activePayload?.[0]?.payload?.id && onContractClick) {
                onContractClick(data.activePayload[0].payload.id);
              }
            }}
          >
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={140} 
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={2} />
            <Bar 
              dataKey="lucro" 
              radius={[0, 4, 4, 0]}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.lucro >= 0 ? '#22c55e' : '#ef4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" /> Lucro
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" /> Prejuízo
          </span>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Clique em um contrato para ver detalhes
        </p>
      </CardContent>
    </Card>
  );
}
