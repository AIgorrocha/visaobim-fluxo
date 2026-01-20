import { useContractDetails } from '@/hooks/useContractFinancials';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

// Formatar valores em BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

interface ContractDetailModalProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractDetailModal({
  projectId,
  open,
  onOpenChange
}: ContractDetailModalProps) {
  const { data, loading, error } = useContractDetails(projectId);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {data?.contract?.project_name || 'Carregando...'}
            {data?.contract && (
              <Badge variant={data.contract.type === 'publico' ? 'default' : 'secondary'}>
                {data.contract.type === 'publico' ? 'Publico' : 'Privado'}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {data?.contract?.client && `Cliente: ${data.contract.client}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando detalhes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">Erro: {error}</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Contrato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(data.contract?.contract_value || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recebido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(data.summary.totalReceived)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Falta: {formatCurrency(data.summary.totalToReceive)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Pago Projetistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(data.summary.totalPaid)}
                  </p>
                  {data.summary.totalPending > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Pendente: {formatCurrency(data.summary.totalPending)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className={`border-l-4 ${data.summary.saldo >= 0 ? 'border-l-emerald-500' : 'border-l-orange-500'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {data.summary.saldo >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    Saldo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-xl font-bold ${data.summary.saldo >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {formatCurrency(data.summary.saldo)}
                  </p>
                  {data.summary.totalExpenses > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Despesas: {formatCurrency(data.summary.totalExpenses)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs com detalhes */}
            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="payments" className="relative">
                  Pagamentos
                  {data.payments.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {data.payments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="income" className="relative">
                  Receitas
                  {data.income.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {data.income.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="expenses" className="relative">
                  Despesas
                  {data.expenses.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {data.expenses.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pricing" className="relative">
                  Precificacao
                  {data.pricing.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {data.pricing.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Pagamentos aos Projetistas */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pagamentos aos Projetistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.payments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum pagamento registrado
                      </p>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Projetista</TableHead>
                              <TableHead>Disciplina</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell className="font-medium">
                                  {payment.designer_name}
                                </TableCell>
                                <TableCell>{payment.discipline}</TableCell>
                                <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                <TableCell>
                                  <Badge variant={payment.status === 'pago' ? 'default' : 'outline'}>
                                    {payment.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(payment.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Total */}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={4}>TOTAL PAGO</TableCell>
                              <TableCell className="text-right text-red-600">
                                {formatCurrency(data.summary.totalPaid)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Receitas */}
              <TabsContent value="income">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Receitas (Medicoes/Parcelas)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.income.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma receita registrada
                      </p>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Descricao</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.income.map((inc) => (
                              <TableRow key={inc.id}>
                                <TableCell>{formatDate(inc.income_date)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{inc.income_type}</Badge>
                                </TableCell>
                                <TableCell>{inc.description || '-'}</TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                  {formatCurrency(inc.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Total */}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={3}>TOTAL RECEBIDO</TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(data.summary.totalReceived)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Despesas */}
              <TabsContent value="expenses">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Despesas do Contrato
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.expenses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma despesa registrada
                      </p>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descricao</TableHead>
                              <TableHead>Centro de Custo</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.expenses.map((expense) => (
                              <TableRow key={expense.id}>
                                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{expense.cost_center}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-purple-600">
                                  {formatCurrency(expense.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Total */}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={3}>TOTAL DESPESAS</TableCell>
                              <TableCell className="text-right text-purple-600">
                                {formatCurrency(data.summary.totalExpenses)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Precificacao */}
              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precificacao por Disciplina
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.pricing.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma precificacao registrada
                      </p>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Disciplina</TableHead>
                              <TableHead>Projetista</TableHead>
                              <TableHead className="text-right">Valor Total</TableHead>
                              <TableHead className="text-right">Valor Projetista</TableHead>
                              <TableHead className="text-right">Pago</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.pricing.map((price) => (
                              <TableRow key={price.id}>
                                <TableCell className="font-medium">
                                  {price.discipline_name}
                                </TableCell>
                                <TableCell>{price.designer_name || '-'}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(price.total_value)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(price.designer_value)}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                  {formatCurrency(price.amount_paid)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      price.status === 'pago' ? 'default' :
                                      price.status === 'parcial' ? 'secondary' : 'outline'
                                    }
                                  >
                                    {price.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Total */}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={2}>TOTAL</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.pricing.reduce((s, p) => s + p.total_value, 0))}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(data.pricing.reduce((s, p) => s + p.designer_value, 0))}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(data.pricing.reduce((s, p) => s + p.amount_paid, 0))}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
