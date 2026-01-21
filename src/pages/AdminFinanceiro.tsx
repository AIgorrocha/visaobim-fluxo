import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  UserPlus,
  Wallet,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import {
  useDisciplines,
  useDesignerPayments,
  useAdminFinancialOverview,
  useProjectPricing
} from '@/hooks/useDesignerFinancials';
import { useContractOverview, useContractIncome } from '@/hooks/useContractFinancials';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';
import { ContractDetailModal } from '@/components/ContractDetailModal';
import { MonthlyFlowChart, ContractProfitChart } from '@/components/charts';
import { ReceivablesProjection } from '@/components/ReceivablesProjection';
import { PayablesProjection } from '@/components/PayablesProjection';
import { DesignerPayment } from '@/types';

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

interface PaymentFormData {
  project_id: string;
  designer_id: string;
  discipline: string;
  newDiscipline: string;
  amount: number;
  payment_date: string;
  description: string;
  sector: 'privado' | 'publico';
  status: 'pago' | 'cancelado';
}

const AdminFinanceiro = () => {
  const { user, profile } = useAuth();
  const { projects, profiles } = useSupabaseData();
  const { disciplines } = useDisciplines();
  const {
    payments,
    loading: paymentsLoading,
    createPayment,
    updatePayment,
    deletePayment,
    refetch
  } = useDesignerPayments();
  const {
    summaryByDesigner,
    loading: overviewLoading
  } = useAdminFinancialOverview();
  const {
    pricing: allPricing,
    updatePricing,
    refetch: refetchPricing
  } = useProjectPricing();
  const {
    contracts,
    publicContracts,
    privateContracts,
    summary: contractSummary,
    loading: contractsLoading
  } = useContractOverview();
  const { income: contractIncome } = useContractIncome();
  const {
    expenses: companyExpenses,
    summary: expensesSummary,
    loading: expensesLoading
  } = useCompanyExpenses();
  const { toast } = useToast();

  // Precificações não atribuídas (sem projetista)
  const unassignedPricing = useMemo(() => {
    return allPricing.filter(p => !p.designer_id);
  }, [allPricing]);

  // Estados
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DesignerPayment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isContractDetailOpen, setIsContractDetailOpen] = useState(false);

  // Filtros
  const [filterDesigner, setFilterDesigner] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterContractStatus, setFilterContractStatus] = useState<string[]>(['EM_ANDAMENTO']);
  const [filterContractType, setFilterContractType] = useState<string>('all');
  // Filtros de Despesas
  const [filterExpenseCostCenter, setFilterExpenseCostCenter] = useState<string>('all');
  const [filterExpenseContract, setFilterExpenseContract] = useState<string>('all');
  const [filterExpenseSector, setFilterExpenseSector] = useState<string>('all');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form data
  const [formData, setFormData] = useState<PaymentFormData>({
    project_id: '',
    designer_id: '',
    discipline: '',
    newDiscipline: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    sector: 'privado',
    status: 'pago'
  });

  // Verificar se usuario e Igor ou Stael (acesso restrito)
  const allowedEmails = ['igor@visaobim.com', 'stael@visaobim.com'];
  const hasAccess = user && profile && allowedEmails.includes(profile.email?.toLowerCase() || '');

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Acesso restrito</p>
      </div>
    );
  }

  // Calcular data de corte baseado no periodo
  const getDateCutoff = (period: string): Date | null => {
    if (period === 'all') return null;
    const now = new Date();
    switch (period) {
      case '30': return new Date(now.setDate(now.getDate() - 30));
      case '60': return new Date(now.setDate(now.getDate() - 60));
      case '90': return new Date(now.setDate(now.getDate() - 90));
      default: return null;
    }
  };

  // Filtrar pagamentos
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (filterDesigner !== 'all' && p.designer_id !== filterDesigner) return false;
      if (filterProject !== 'all' && p.project_id !== filterProject) return false;
      if (filterSector !== 'all' && p.sector !== filterSector) return false;

      if (filterPeriod !== 'all' && filterPeriod !== 'custom') {
        const cutoff = getDateCutoff(filterPeriod);
        if (cutoff && new Date(p.payment_date) < cutoff) return false;
      }

      if (filterPeriod === 'custom') {
        const paymentDate = new Date(p.payment_date);
        if (customDateStart && paymentDate < new Date(customDateStart)) return false;
        if (customDateEnd && paymentDate > new Date(customDateEnd)) return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchProject = p.project_name?.toLowerCase().includes(term);
        const matchDiscipline = p.discipline.toLowerCase().includes(term);
        const matchDesigner = p.designer_name?.toLowerCase().includes(term);
        if (!matchProject && !matchDiscipline && !matchDesigner) return false;
      }
      return true;
    });
  }, [payments, filterDesigner, filterProject, filterSector, filterPeriod, customDateStart, customDateEnd, searchTerm]);

  // Totais
  const totals = useMemo(() => {
    const totalPaid = filteredPayments
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalPaid };
  }, [filteredPayments]);

  // Abrir modal para novo pagamento
  const handleAddPayment = () => {
    setEditingPayment(null);
    setFormData({
      project_id: '',
      designer_id: '',
      discipline: '',
      newDiscipline: '',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      description: '',
      sector: 'privado',
      status: 'pago'
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditPayment = (payment: DesignerPayment) => {
    setEditingPayment(payment);
    const paymentStatus = payment.status === 'pendente' ? 'pago' : payment.status;
    setFormData({
      project_id: payment.project_id || '',
      designer_id: payment.designer_id,
      discipline: payment.discipline,
      newDiscipline: '',
      amount: payment.amount,
      payment_date: payment.payment_date,
      description: payment.description || '',
      sector: payment.sector,
      status: paymentStatus as 'pago' | 'cancelado'
    });
    setIsModalOpen(true);
  };

  // Confirmar delete
  const handleDeleteClick = (id: string) => {
    setDeletingPaymentId(id);
    setIsDeleteDialogOpen(true);
  };

  // Executar delete
  const handleConfirmDelete = async () => {
    if (!deletingPaymentId) return;

    try {
      await deletePayment(deletingPaymentId);
      toast({
        title: 'Pagamento removido',
        description: 'O pagamento foi removido com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingPaymentId(null);
    }
  };

  // Salvar pagamento
  const handleSavePayment = async () => {
    try {
      if (!formData.designer_id) {
        toast({
          title: 'Projetista obrigatorio',
          description: 'Selecione um projetista',
          variant: 'destructive'
        });
        return;
      }

      const disciplineName = formData.discipline === '__new__'
        ? formData.newDiscipline.trim()
        : formData.discipline;

      if (!disciplineName) {
        toast({
          title: 'Disciplina obrigatoria',
          description: 'Selecione ou digite uma disciplina',
          variant: 'destructive'
        });
        return;
      }

      if (formData.amount <= 0) {
        toast({
          title: 'Valor invalido',
          description: 'O valor deve ser maior que zero',
          variant: 'destructive'
        });
        return;
      }

      let projectName = '';
      if (formData.project_id) {
        const project = projects.find(p => p.id === formData.project_id);
        if (project) projectName = project.name;
      }

      const projectId = formData.project_id && formData.project_id.trim() !== ''
        ? formData.project_id
        : null;

      const dataToSave: any = {
        designer_id: formData.designer_id,
        discipline: disciplineName,
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        sector: formData.sector,
        status: formData.status
      };

      if (projectId) dataToSave.project_id = projectId;
      if (projectName) dataToSave.project_name = projectName;
      if (formData.description?.trim()) dataToSave.description = formData.description;
      if (user.id) dataToSave.created_by = user.id;

      if (editingPayment) {
        await updatePayment(editingPayment.id, dataToSave);
        toast({
          title: 'Pagamento atualizado',
          description: 'O pagamento foi atualizado com sucesso'
        });
      } else {
        await createPayment(dataToSave);
        toast({
          title: 'Pagamento registrado',
          description: 'O pagamento foi registrado com sucesso'
        });
      }

      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro desconhecido ao salvar pagamento',
        variant: 'destructive'
      });
    }
  };

  // Filtrar despesas
  const filteredExpenses = useMemo(() => {
    let filtered = companyExpenses;
    if (filterExpenseCostCenter !== 'all') {
      filtered = filtered.filter(e => e.cost_center === filterExpenseCostCenter);
    }
    if (filterExpenseContract !== 'all') {
      filtered = filtered.filter(e => e.contract_name === filterExpenseContract);
    }
    if (filterExpenseSector !== 'all') {
      filtered = filtered.filter(e => e.sector === filterExpenseSector);
    }
    return filtered;
  }, [companyExpenses, filterExpenseCostCenter, filterExpenseContract, filterExpenseSector]);

  const filteredPublicExpenses = useMemo(() => filteredExpenses.filter(e => e.sector === 'publico'), [filteredExpenses]);
  const filteredPrivateExpenses = useMemo(() => filteredExpenses.filter(e => e.sector === 'privado'), [filteredExpenses]);

  const filteredExpensesSummary = useMemo(() => ({
    totalPublico: filteredPublicExpenses.reduce((s, e) => s + Number(e.amount), 0),
    totalPrivado: filteredPrivateExpenses.reduce((s, e) => s + Number(e.amount), 0),
    totalGeral: filteredExpenses.reduce((s, e) => s + Number(e.amount), 0),
    countPublico: filteredPublicExpenses.length,
    countPrivado: filteredPrivateExpenses.length
  }), [filteredExpenses, filteredPublicExpenses, filteredPrivateExpenses]);

  // Todos os contratos combinados para filtros
  const allContracts = useMemo(() => [...publicContracts, ...privateContracts], [publicContracts, privateContracts]);

  // Filtrar contratos por status e tipo
  const filteredContracts = useMemo(() => {
    let filtered = allContracts.filter(c => c.status !== 'EM_ESPERA');

    if (filterContractStatus.length > 0 && !filterContractStatus.includes('all')) {
      filtered = filtered.filter(c => filterContractStatus.includes(c.status));
    }

    if (filterContractType !== 'all') {
      filtered = filtered.filter(c => c.type === filterContractType);
    }

    return filtered;
  }, [allContracts, filterContractStatus, filterContractType]);

  // Resumo filtrado
  const filteredContractSummary = useMemo(() => {
    return {
      totalContractValue: filteredContracts.reduce((s, c) => s + c.contract_value, 0),
      totalReceived: filteredContracts.reduce((s, c) => s + c.total_received, 0),
      totalToReceive: filteredContracts.reduce((s, c) => s + c.amount_to_receive, 0),
      totalPaidDesigners: filteredContracts.reduce((s, c) => s + c.total_paid_designers, 0),
      totalToPayDesigners: filteredContracts.reduce((s, c) => s + c.amount_to_pay_designers, 0),
      totalExpenses_contratos: filteredContracts.reduce((s, c) => s + c.total_expenses, 0),
      totalExpenses_empresa: contractSummary.totalExpenses_empresa || 0,
      count: filteredContracts.length
    };
  }, [filteredContracts, contractSummary]);

  // Dados para gráficos
  const incomeByMonth = useMemo(() => {
    const grouped: Record<string, number> = {};
    contractIncome.forEach(i => {
      const month = i.income_date?.substring(0, 7) || '';
      if (month) {
        grouped[month] = (grouped[month] || 0) + Number(i.amount);
      }
    });
    return Object.entries(grouped).map(([month, amount]) => ({ month, amount }));
  }, [contractIncome]);

  const paymentsByMonth = useMemo(() => {
    const grouped: Record<string, number> = {};
    payments.filter(p => p.status === 'pago').forEach(p => {
      const month = p.payment_date?.substring(0, 7) || '';
      if (month) {
        grouped[month] = (grouped[month] || 0) + Number(p.amount);
      }
    });
    return Object.entries(grouped).map(([month, amount]) => ({ month, amount }));
  }, [payments]);

  const expensesByMonth = useMemo(() => {
    const grouped: Record<string, number> = {};
    companyExpenses.forEach(e => {
      const month = e.expense_date?.substring(0, 7) || '';
      if (month) {
        grouped[month] = (grouped[month] || 0) + Number(e.amount);
      }
    });
    return Object.entries(grouped).map(([month, amount]) => ({ month, amount }));
  }, [companyExpenses]);

  // Saldo líquido
  const saldoLiquido = filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos;

  const loading = paymentsLoading || overviewLoading;

  const handleContractClick = (projectId: string) => {
    setSelectedContractId(projectId);
    setIsContractDetailOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-muted-foreground">
            Controle de receitas, pagamentos e projeções financeiras
          </p>
        </div>
        <Button onClick={handleAddPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>
      </motion.div>

      {/* Cards de Resumo Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(filteredContractSummary.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              de {formatCurrency(filteredContractSummary.totalContractValue)} em contratos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago Projetistas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(filteredContractSummary.totalPaidDesigners)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryByDesigner.length} projetistas ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Operacionais</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(filteredContractSummary.totalExpenses_contratos + filteredContractSummary.totalExpenses_empresa)}
            </div>
            <p className="text-xs text-muted-foreground">
              {companyExpenses.length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${saldoLiquido >= 0 ? 'border-l-blue-500' : 'border-l-red-600'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <TrendingUp className={`h-4 w-4 ${saldoLiquido >= 0 ? 'text-blue-500' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(saldoLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recebido - Pago - Despesas
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="projetistas">Por Projetista</TabsTrigger>
            <TabsTrigger value="nao-atribuidas" className="relative">
              Não Atribuídas
              {unassignedPricing.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unassignedPricing.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
          </TabsList>

          {/* Tab Visão Geral de Contratos */}
          <TabsContent value="visao-geral" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Label className="font-semibold">Filtros:</Label>

              <Select value={filterContractType} onValueChange={setFilterContractType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-3 items-center">
                <Label className="text-sm">Status:</Label>
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguard. Pagamento' },
                  { value: 'CONCLUIDO', label: 'Concluído' }
                ].map(status => (
                  <div key={status.value} className="flex items-center space-x-1">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={status.value === 'all'
                        ? filterContractStatus.includes('all')
                        : filterContractStatus.includes(status.value)}
                      onCheckedChange={(checked) => {
                        if (status.value === 'all') {
                          setFilterContractStatus(checked ? ['all'] : []);
                        } else {
                          if (checked) {
                            setFilterContractStatus(prev =>
                              [...prev.filter(s => s !== 'all'), status.value]
                            );
                          } else {
                            setFilterContractStatus(prev =>
                              prev.filter(s => s !== status.value)
                            );
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="text-xs cursor-pointer select-none"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>

              {(filterContractType !== 'all' || (filterContractStatus.length !== 1 || filterContractStatus[0] !== 'EM_ANDAMENTO')) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterContractType('all');
                    setFilterContractStatus(['EM_ANDAMENTO']);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}

              <Badge variant="outline" className="ml-auto">
                {filteredContractSummary.count} contratos
              </Badge>
            </div>

            {/* Gráficos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <MonthlyFlowChart
                incomeData={incomeByMonth}
                expenseData={expensesByMonth}
                paymentsData={paymentsByMonth}
              />
              <ContractProfitChart
                contracts={filteredContracts}
                onContractClick={handleContractClick}
              />
            </div>

            {/* Projeções */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReceivablesProjection
                contracts={filteredContracts}
                onContractClick={handleContractClick}
              />
              <PayablesProjection
                contracts={filteredContracts}
                onContractClick={handleContractClick}
              />
            </div>

            {/* Tabelas de Contratos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contratos Públicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default">Público</Badge>
                    Contratos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contrato</TableHead>
                          <TableHead className="text-right">Recebido</TableHead>
                          <TableHead className="text-right">Lucro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContracts
                          .filter(c => c.type === 'publico')
                          .map(contract => (
                            <TableRow
                              key={contract.project_id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleContractClick(contract.project_id)}
                            >
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {contract.project_name}
                              </TableCell>
                              <TableCell className="text-right text-emerald-600">
                                {formatCurrency(contract.total_received)}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${contract.profit_margin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(contract.profit_margin)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Contratos Privados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">Privado</Badge>
                    Contratos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contrato</TableHead>
                          <TableHead className="text-right">Recebido</TableHead>
                          <TableHead className="text-right">Lucro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContracts
                          .filter(c => c.type === 'privado')
                          .map(contract => (
                            <TableRow
                              key={contract.project_id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleContractClick(contract.project_id)}
                            >
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {contract.project_name}
                              </TableCell>
                              <TableCell className="text-right text-emerald-600">
                                {formatCurrency(contract.total_received)}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${contract.profit_margin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(contract.profit_margin)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Pagamentos */}
          <TabsContent value="pagamentos">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Todos os pagamentos realizados aos projetistas</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Buscar por projeto, disciplina ou projetista..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={filterDesigner} onValueChange={setFilterDesigner}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Projetista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {profiles.filter(p => p.id).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterSector} onValueChange={setFilterSector}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="privado">Privado</SelectItem>
                      <SelectItem value="publico">Público</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo período</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="60">Últimos 60 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>

                  {filterPeriod === 'custom' && (
                    <>
                      <Input
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="w-[140px]"
                      />
                      <Input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-[140px]"
                      />
                    </>
                  )}
                </div>

                {/* Tabela */}
                {loading ? (
                  <p className="text-center py-4 text-muted-foreground">Carregando...</p>
                ) : filteredPayments.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Projetista</TableHead>
                          <TableHead>Projeto</TableHead>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.slice(0, 50).map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell className="font-medium">
                              {payment.designer_name || 'N/A'}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {payment.project_name || '-'}
                            </TableCell>
                            <TableCell>{payment.discipline}</TableCell>
                            <TableCell>
                              <Badge variant={payment.sector === 'publico' ? 'default' : 'secondary'}>
                                {payment.sector === 'publico' ? 'Público' : 'Privado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={payment.status === 'pago' ? 'default' : 'destructive'}
                                className={payment.status === 'pago' ? 'bg-emerald-500' : ''}
                              >
                                {payment.status === 'pago' ? 'Pago' : 'Cancelado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPayment(payment)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(payment.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredPayments.length > 50 && (
                      <p className="text-center py-2 text-sm text-muted-foreground">
                        Mostrando 50 de {filteredPayments.length} pagamentos
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Projetistas */}
          <TabsContent value="projetistas">
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Projetista</CardTitle>
                <CardDescription>Visão consolidada de cada projetista</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-4 text-muted-foreground">Carregando...</p>
                ) : summaryByDesigner.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhum dado encontrado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projetista</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Pagamentos</TableHead>
                        <TableHead className="text-right">Total Recebido</TableHead>
                        <TableHead className="text-right">A Receber</TableHead>
                        <TableHead>Último Pagamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryByDesigner.map((item) => (
                        <TableRow key={item.designer_id}>
                          <TableCell className="font-medium">{item.designer_name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.designer_email}</TableCell>
                          <TableCell className="text-right">{item.total_payments}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {formatCurrency(item.total_received)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-amber-600">
                            {formatCurrency(item.total_pending)}
                          </TableCell>
                          <TableCell>
                            {item.last_payment_date
                              ? formatDate(item.last_payment_date)
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Não Atribuídas */}
          <TabsContent value="nao-atribuidas">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle>Precificações Não Atribuídas</CardTitle>
                </div>
                <CardDescription>
                  Disciplinas precificadas sem projetista designado. Atribua um projetista para que apareça no financeiro dele.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unassignedPricing.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                    <p className="text-lg font-medium text-emerald-600">Tudo certo!</p>
                    <p>Todas as precificações têm projetista atribuído.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">Valor Projetista</TableHead>
                        <TableHead>Atribuir Projetista</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedPricing.map((item) => (
                        <TableRow key={item.id} className="bg-amber-50 dark:bg-amber-950/20">
                          <TableCell className="font-medium">{item.project_name || 'Sem projeto'}</TableCell>
                          <TableCell>{item.discipline_name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(item.total_value))}</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {formatCurrency(Number(item.designer_value))}
                          </TableCell>
                          <TableCell>
                            <Select
                              onValueChange={async (designerId) => {
                                try {
                                  await updatePricing(item.id, { designer_id: designerId });
                                  await refetchPricing();
                                  toast({
                                    title: 'Projetista atribuído!',
                                    description: `Disciplina ${item.discipline_name} atribuída com sucesso.`,
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Erro',
                                    description: 'Não foi possível atribuir o projetista.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {profiles.filter(p => p.id).map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Despesas da Empresa */}
          <TabsContent value="despesas">
            {/* Filtros de Despesas */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <Label className="font-semibold">Filtros:</Label>
              <Select value={filterExpenseSector} onValueChange={setFilterExpenseSector}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Setores</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterExpenseCostCenter} onValueChange={setFilterExpenseCostCenter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Centro de Custo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Centros de Custo</SelectItem>
                  {expensesSummary.byCostCenter.map((cc) => (
                    <SelectItem key={cc.cost_center} value={cc.cost_center}>
                      {cc.cost_center} ({cc.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterExpenseContract} onValueChange={setFilterExpenseContract}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Contratos</SelectItem>
                  {expensesSummary.byContract.map((c) => (
                    <SelectItem key={c.contract_name} value={c.contract_name}>
                      {c.contract_name} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filterExpenseCostCenter !== 'all' || filterExpenseContract !== 'all' || filterExpenseSector !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterExpenseCostCenter('all');
                    setFilterExpenseContract('all');
                    setFilterExpenseSector('all');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}

              <Badge variant="outline" className="ml-auto">
                {filteredExpenses.length} despesas | {formatCurrency(filteredExpensesSummary.totalGeral)}
              </Badge>
            </div>

            {/* Cards de Resumo das Despesas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas Público</CardTitle>
                  <DollarSign className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(filteredExpensesSummary.totalPublico)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredExpensesSummary.countPublico} despesas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas Privado</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(filteredExpensesSummary.totalPrivado)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredExpensesSummary.countPrivado} despesas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(filteredExpensesSummary.totalGeral)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredExpenses.length} despesas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Despesas */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Centro de Custo</TableHead>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.slice(0, 100).map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatDate(expense.expense_date)}</TableCell>
                          <TableCell className="max-w-[250px] truncate">{expense.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{expense.cost_center}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">{expense.contract_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={expense.sector === 'publico' ? 'default' : 'secondary'}>
                              {expense.sector === 'publico' ? 'Público' : 'Privado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(Number(expense.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal de Pagamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Editar Pagamento' : 'Registrar Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment ? 'Atualize os dados do pagamento' : 'Registre um novo pagamento a projetista'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Projetista *</Label>
              <Select
                value={formData.designer_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, designer_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projetista" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.filter(p => p.id).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Projeto (opcional)</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem projeto</SelectItem>
                  {projects.filter(p => p.id).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Disciplina *</Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) => setFormData(prev => ({ ...prev, discipline: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Nova disciplina</SelectItem>
                </SelectContent>
              </Select>
              {formData.discipline === '__new__' && (
                <Input
                  className="mt-2"
                  placeholder="Digite o nome da nova disciplina"
                  value={formData.newDiscipline}
                  onChange={(e) => setFormData(prev => ({ ...prev, newDiscipline: e.target.value }))}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Setor</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(value: 'privado' | 'publico') => setFormData(prev => ({ ...prev, sector: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privado">Privado</SelectItem>
                    <SelectItem value="publico">Público</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'pago' | 'cancelado') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePayment}>
              {editingPayment ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Delete */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Detalhes do Contrato */}
      <ContractDetailModal
        projectId={selectedContractId}
        open={isContractDetailOpen}
        onOpenChange={(open) => {
          setIsContractDetailOpen(open);
          if (!open) setSelectedContractId(null);
        }}
      />
    </div>
  );
};

export default AdminFinanceiro;
