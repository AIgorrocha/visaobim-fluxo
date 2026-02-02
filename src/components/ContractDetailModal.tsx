import { useState } from 'react';
import { useContractDetails } from '@/hooks/useContractFinancials';
import { useContractIncome } from '@/hooks/useContractFinancials';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';
import { useDesignerPayments, useProjectPricing } from '@/hooks/useDesignerFinancials';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  CreditCard,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw
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

// Status disponiveis
const PROJECT_STATUSES = [
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando Aprovacao' },
  { value: 'CONCLUIDO', label: 'Concluido' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'EM_ESPERA', label: 'Em Espera' }
];

interface ContractDetailModalProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataChanged?: () => void;
}

export function ContractDetailModal({
  projectId,
  open,
  onOpenChange,
  onDataChanged
}: ContractDetailModalProps) {
  const { data, loading, error, refetch } = useContractDetails(projectId);
  const { updateIncome, deleteIncome } = useContractIncome();
  const { deletePayment, updatePayment } = useDesignerPayments();
  const { updatePricing } = useProjectPricing();
  const { deleteExpense, updateExpense } = useCompanyExpenses();
  const { toast } = useToast();

  // Estados de edicao
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);

  // Estados de formulario de edicao
  const [editForm, setEditForm] = useState<any>({});

  // Estados de confirmacao de exclusao
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'income' | 'payment' | 'expense' | 'pricing' | null;
    id: string | null;
    description: string;
  }>({ type: null, id: null, description: '' });

  // Salvar status do projeto
  const handleSaveStatus = async (newStatus: string) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      toast({ title: 'Status atualizado com sucesso!' });
      setEditingStatus(false);
      refetch();
      onDataChanged?.();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar status', description: err.message, variant: 'destructive' });
    }
  };

  // Salvar receita editada
  const handleSaveIncome = async (id: string) => {
    try {
      const result = await updateIncome(id, {
        amount: editForm.amount,
        income_date: editForm.income_date,
        description: editForm.description,
        income_type: editForm.income_type
      });

      if (!result.success) throw new Error(result.error);

      toast({ title: 'Receita atualizada!' });
      setEditingIncomeId(null);
      refetch();
      onDataChanged?.();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    }
  };

  // Salvar pagamento editado
  const handleSavePayment = async (id: string) => {
    try {
      const result = await updatePayment(id, {
        amount: editForm.amount,
        payment_date: editForm.payment_date,
        description: editForm.description,
        status: editForm.status
      });

      if (!result.success) throw new Error(result.error);

      toast({ title: 'Pagamento atualizado!' });
      setEditingPaymentId(null);
      refetch();
      onDataChanged?.();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    }
  };

  // Salvar despesa editada
  const handleSaveExpense = async (id: string) => {
    try {
      const result = await updateExpense(id, {
        amount: editForm.amount,
        expense_date: editForm.expense_date,
        description: editForm.description,
        cost_center: editForm.cost_center
      });

      if (!result.success) throw new Error(result.error);

      toast({ title: 'Despesa atualizada!' });
      setEditingExpenseId(null);
      refetch();
      onDataChanged?.();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    }
  };

  // Salvar precificacao editada
  const handleSavePricing = async (id: string) => {
    try {
      const result = await updatePricing(id, {
        total_value: editForm.total_value,
        designer_value: editForm.designer_value,
        amount_paid: editForm.amount_paid,
        status: editForm.status
      });

      if (!result.success) throw new Error(result.error);

      toast({ title: 'Precificacao atualizada!' });
      setEditingPricingId(null);
      refetch();
      onDataChanged?.();
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    }
  };

  // Confirmar e executar exclusao
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.type || !deleteConfirm.id) return;

    try {
      let result;
      switch (deleteConfirm.type) {
        case 'income':
          result = await deleteIncome(deleteConfirm.id);
          break;
        case 'payment':
          result = await deletePayment(deleteConfirm.id);
          break;
        case 'expense':
          result = await deleteExpense(deleteConfirm.id);
          break;
        case 'pricing':
          // Precificacao normalmente nao deve ser deletada, mas se necessario:
          const { error } = await supabase
            .from('project_pricing')
            .delete()
            .eq('id', deleteConfirm.id);
          result = { success: !error, error: error?.message };
          break;
      }

      if (!result?.success) throw new Error(result?.error);

      toast({ title: 'Excluido com sucesso!' });
      setDeleteConfirm({ type: null, id: null, description: '' });
      refetch();
      onDataChanged?.();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  // Iniciar edicao de item
  const startEditIncome = (item: any) => {
    setEditForm({
      amount: item.amount,
      income_date: item.income_date,
      description: item.description || '',
      income_type: item.income_type
    });
    setEditingIncomeId(item.id);
  };

  const startEditPayment = (item: any) => {
    setEditForm({
      amount: item.amount,
      payment_date: item.payment_date,
      description: item.description || '',
      status: item.status
    });
    setEditingPaymentId(item.id);
  };

  const startEditExpense = (item: any) => {
    setEditForm({
      amount: item.amount,
      expense_date: item.expense_date,
      description: item.description || '',
      cost_center: item.cost_center
    });
    setEditingExpenseId(item.id);
  };

  const startEditPricing = (item: any) => {
    setEditForm({
      total_value: item.total_value,
      designer_value: item.designer_value,
      amount_paid: item.amount_paid,
      status: item.status
    });
    setEditingPricingId(item.id);
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {data?.contract?.project_name || 'Carregando...'}
              {data?.contract && (
                <>
                  <Badge variant={data.contract.type === 'publico' ? 'default' : 'secondary'}>
                    {data.contract.type === 'publico' ? 'Publico' : 'Privado'}
                  </Badge>
                  {editingStatus ? (
                    <div className="flex items-center gap-2">
                      <Select
                        defaultValue={data.contract.status}
                        onValueChange={(value) => handleSaveStatus(value)}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={() => setEditingStatus(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setEditingStatus(true)}
                    >
                      {data.contract.status.replace(/_/g, ' ')}
                      <Pencil className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => refetch()} className="ml-auto">
                <RefreshCw className="h-4 w-4" />
              </Button>
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
              <Tabs defaultValue="income" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="income" className="relative">
                    Receitas
                    {data.income.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {data.income.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="relative">
                    Pagamentos
                    {data.payments.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {data.payments.length}
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
                                <TableHead className="w-[100px]">Acoes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.income.map((inc) => (
                                <TableRow key={inc.id}>
                                  {editingIncomeId === inc.id ? (
                                    <>
                                      <TableCell>
                                        <Input
                                          type="date"
                                          value={editForm.income_date}
                                          onChange={(e) => setEditForm({ ...editForm, income_date: e.target.value })}
                                          className="w-[130px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={editForm.income_type}
                                          onValueChange={(v) => setEditForm({ ...editForm, income_type: v })}
                                        >
                                          <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="medicao">Medicao</SelectItem>
                                            <SelectItem value="entrada">Entrada</SelectItem>
                                            <SelectItem value="parcela">Parcela</SelectItem>
                                            <SelectItem value="outro">Outro</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          value={editForm.description}
                                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                          className="w-full"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editForm.amount}
                                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                                          className="w-[120px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => handleSaveIncome(inc.id)}>
                                            <Save className="h-4 w-4 text-green-600" />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={() => setEditingIncomeId(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  ) : (
                                    <>
                                      <TableCell>{formatDate(inc.income_date)}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{inc.income_type}</Badge>
                                      </TableCell>
                                      <TableCell>{inc.description || '-'}</TableCell>
                                      <TableCell className="text-right font-semibold text-green-600">
                                        {formatCurrency(inc.amount)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => startEditIncome(inc)}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeleteConfirm({
                                              type: 'income',
                                              id: inc.id,
                                              description: `${formatCurrency(inc.amount)} - ${inc.description || inc.income_type}`
                                            })}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))}
                              {/* Total */}
                              <TableRow className="bg-muted/50 font-bold">
                                <TableCell colSpan={3}>TOTAL RECEBIDO</TableCell>
                                <TableCell className="text-right text-green-600">
                                  {formatCurrency(data.summary.totalReceived)}
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
                                <TableHead className="w-[100px]">Acoes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.payments.map((payment) => (
                                <TableRow key={payment.id}>
                                  {editingPaymentId === payment.id ? (
                                    <>
                                      <TableCell className="font-medium">
                                        {payment.designer_name}
                                      </TableCell>
                                      <TableCell>{payment.discipline}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="date"
                                          value={editForm.payment_date}
                                          onChange={(e) => setEditForm({ ...editForm, payment_date: e.target.value })}
                                          className="w-[130px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={editForm.status}
                                          onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                                        >
                                          <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pago">Pago</SelectItem>
                                            <SelectItem value="pendente">Pendente</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editForm.amount}
                                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                                          className="w-[120px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => handleSavePayment(payment.id)}>
                                            <Save className="h-4 w-4 text-green-600" />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={() => setEditingPaymentId(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  ) : (
                                    <>
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
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => startEditPayment(payment)}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeleteConfirm({
                                              type: 'payment',
                                              id: payment.id,
                                              description: `${payment.designer_name} - ${formatCurrency(payment.amount)}`
                                            })}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))}
                              {/* Total */}
                              <TableRow className="bg-muted/50 font-bold">
                                <TableCell colSpan={4}>TOTAL PAGO</TableCell>
                                <TableCell className="text-right text-red-600">
                                  {formatCurrency(data.summary.totalPaid)}
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
                                <TableHead className="w-[100px]">Acoes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                  {editingExpenseId === expense.id ? (
                                    <>
                                      <TableCell>
                                        <Input
                                          type="date"
                                          value={editForm.expense_date}
                                          onChange={(e) => setEditForm({ ...editForm, expense_date: e.target.value })}
                                          className="w-[130px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          value={editForm.description}
                                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          value={editForm.cost_center}
                                          onChange={(e) => setEditForm({ ...editForm, cost_center: e.target.value })}
                                          className="w-[120px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editForm.amount}
                                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                                          className="w-[120px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => handleSaveExpense(expense.id)}>
                                            <Save className="h-4 w-4 text-green-600" />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={() => setEditingExpenseId(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  ) : (
                                    <>
                                      <TableCell>{formatDate(expense.expense_date)}</TableCell>
                                      <TableCell>{expense.description}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{expense.cost_center}</Badge>
                                      </TableCell>
                                      <TableCell className="text-right font-semibold text-purple-600">
                                        {formatCurrency(expense.amount)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => startEditExpense(expense)}>
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeleteConfirm({
                                              type: 'expense',
                                              id: expense.id,
                                              description: `${expense.description} - ${formatCurrency(expense.amount)}`
                                            })}
                                          >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  )}
                                </TableRow>
                              ))}
                              {/* Total */}
                              <TableRow className="bg-muted/50 font-bold">
                                <TableCell colSpan={3}>TOTAL DESPESAS</TableCell>
                                <TableCell className="text-right text-purple-600">
                                  {formatCurrency(data.summary.totalExpenses)}
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
                                <TableHead className="w-[80px]">Acoes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.pricing.map((price) => (
                                <TableRow key={price.id}>
                                  {editingPricingId === price.id ? (
                                    <>
                                      <TableCell className="font-medium">
                                        {price.discipline_name}
                                      </TableCell>
                                      <TableCell>{price.designer_name || '-'}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editForm.total_value}
                                          onChange={(e) => setEditForm({ ...editForm, total_value: parseFloat(e.target.value) || 0 })}
                                          className="w-[100px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editForm.designer_value}
                                          onChange={(e) => setEditForm({ ...editForm, designer_value: parseFloat(e.target.value) || 0 })}
                                          className="w-[100px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editForm.amount_paid}
                                          onChange={(e) => setEditForm({ ...editForm, amount_paid: parseFloat(e.target.value) || 0 })}
                                          className="w-[100px]"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={editForm.status}
                                          onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                                        >
                                          <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pendente">Pendente</SelectItem>
                                            <SelectItem value="parcial">Parcial</SelectItem>
                                            <SelectItem value="pago">Pago</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button size="sm" variant="ghost" onClick={() => handleSavePricing(price.id)}>
                                            <Save className="h-4 w-4 text-green-600" />
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={() => setEditingPricingId(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </>
                                  ) : (
                                    <>
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
                                      <TableCell>
                                        <Button size="sm" variant="ghost" onClick={() => startEditPricing(price)}>
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </>
                                  )}
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
                                <TableCell colSpan={2}></TableCell>
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

      {/* Dialog de confirmacao de exclusao */}
      <AlertDialog open={deleteConfirm.type !== null} onOpenChange={(open) => !open && setDeleteConfirm({ type: null, id: null, description: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro?
              <br />
              <strong>{deleteConfirm.description}</strong>
              <br /><br />
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
