import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { addDays, isAfter, isBefore, parseISO, format } from 'date-fns';

interface Contract {
  project_id: string;
  project_name: string;
  amount_to_pay_designers: number;
  total_paid_designers: number;
  contract_end?: string;
  status: string;
}

interface PayablesProjectionProps {
  contracts: Contract[];
  onContractClick?: (projectId: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

type PeriodType = '30' | '60' | '90' | 'custom' | 'all';

export function PayablesProjection({ contracts, onContractClick }: PayablesProjectionProps) {
  const [period, setPeriod] = useState<PeriodType>('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredContracts = useMemo(() => {
    const now = new Date();
    
    // Filtrar apenas contratos com valor a pagar
    let filtered = contracts.filter(c => c.amount_to_pay_designers > 0);

    if (period === 'all') {
      return filtered.sort((a, b) => b.amount_to_pay_designers - a.amount_to_pay_designers);
    }

    if (period === 'custom' && customStart && customEnd) {
      const start = parseISO(customStart);
      const end = parseISO(customEnd);
      
      filtered = filtered.filter(c => {
        if (!c.contract_end) return false;
        const contractDate = parseISO(c.contract_end);
        return isAfter(contractDate, start) && isBefore(contractDate, end);
      });
    } else if (period !== 'custom') {
      const days = parseInt(period);
      const cutoffDate = addDays(now, days);
      
      filtered = filtered.filter(c => {
        if (!c.contract_end) return false;
        const contractDate = parseISO(c.contract_end);
        return isBefore(contractDate, cutoffDate) && isAfter(contractDate, now);
      });
    }

    return filtered.sort((a, b) => {
      if (!a.contract_end) return 1;
      if (!b.contract_end) return -1;
      return new Date(a.contract_end).getTime() - new Date(b.contract_end).getTime();
    });
  }, [contracts, period, customStart, customEnd]);

  const totalToPay = useMemo(() => {
    return filteredContracts.reduce((sum, c) => sum + c.amount_to_pay_designers, 0);
  }, [filteredContracts]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            A Pagar Projetistas
          </CardTitle>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            {formatCurrency(totalToPay)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros de Período */}
        <div className="flex flex-wrap gap-2">
          {(['30', '60', '90', 'all'] as PeriodType[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === 'all' ? 'Todos' : `${p} dias`}
            </Button>
          ))}
          <Button
            variant={period === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('custom')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Personalizado
          </Button>
        </div>

        {/* Filtro Personalizado */}
        {period === 'custom' && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs">De</Label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="flex-1">
              <Label className="text-xs">Até</Label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Lista de Contratos */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {filteredContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum pagamento previsto para este período
            </p>
          ) : (
            filteredContracts.map((contract) => (
              <div
                key={contract.project_id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onContractClick?.(contract.project_id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{contract.project_name}</p>
                  {contract.contract_end && (
                    <p className="text-xs text-muted-foreground">
                      Prazo: {format(parseISO(contract.contract_end), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-orange-600 text-sm">
                    {formatCurrency(contract.amount_to_pay_designers)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pago: {formatCurrency(contract.total_paid_designers)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{filteredContracts.length} contratos</span>
            <span className="font-semibold text-orange-600">{formatCurrency(totalToPay)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
