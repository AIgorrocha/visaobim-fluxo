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
  Save,
  X,
  Filter,
  Download,
  Search,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import {
  useDisciplines,
  useDesignerPayments,
  useAdminFinancialOverview,
  useProjectPricing
} from '@/hooks/useDesignerFinancials';
import { useContractOverview } from '@/hooks/useContractFinancials';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';
import { ContractDetailModal } from '@/components/ContractDetailModal';
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
  status: 'pendente' | 'pago' | 'cancelado';
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
  const {
    expenses: companyExpenses,
    publicExpenses: publicCompanyExpenses,
    privateExpenses: privateCompanyExpenses,
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
  const [filterContractStatus, setFilterContractStatus] = useState<string>('EM_ANDAMENTO'); // Filtro de status para Visão Geral
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

      // Filtro de periodo
      if (filterPeriod !== 'all' && filterPeriod !== 'custom') {
        const cutoff = getDateCutoff(filterPeriod);
        if (cutoff && new Date(p.payment_date) < cutoff) return false;
      }

      // Filtro personalizado
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

    const totalPending = filteredPayments
      .filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return { totalPaid, totalPending };
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
    setFormData({
      project_id: payment.project_id || '',
      designer_id: payment.designer_id,
      discipline: payment.discipline,
      newDiscipline: '',
      amount: payment.amount,
      payment_date: payment.payment_date,
      description: payment.description || '',
      sector: payment.sector,
      status: payment.status
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
      // Validar
      if (!formData.designer_id) {
        toast({
          title: 'Projetista obrigatorio',
          description: 'Selecione um projetista',
          variant: 'destructive'
        });
        return;
      }

      // Determinar disciplina (nova ou existente)
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

      // Buscar nome do projeto se selecionado
      let projectName = '';
      if (formData.project_id) {
        const project = projects.find(p => p.id === formData.project_id);
        if (project) projectName = project.name;
      }

      // Garantir que project_id seja null se vazio (evitar erro de FK)
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

      // Adicionar campos opcionais apenas se tiverem valor
      if (projectId) dataToSave.project_id = projectId;
      if (projectName) dataToSave.project_name = projectName;
      if (formData.description?.trim()) dataToSave.description = formData.description;
      if (user.id) dataToSave.created_by = user.id;

      console.log('Salvando pagamento:', dataToSave);

      if (editingPayment) {
        await updatePayment(editingPayment.id, dataToSave);
        toast({
          title: 'Pagamento atualizado',
          description: 'O pagamento foi atualizado com sucesso'
        });
      } else {
        const result = await createPayment(dataToSave);
        console.log('Pagamento criado:', result);
        toast({
          title: 'Pagamento registrado',
          description: 'O pagamento foi registrado com sucesso'
        });
      }

      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Erro ao salvar pagamento:', error);
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

  // Filtrar contratos por status para Visão Geral
  const filteredPublicContracts = useMemo(() => {
    if (filterContractStatus === 'all') return publicContracts;
    return publicContracts.filter(c => c.status === filterContractStatus);
  }, [publicContracts, filterContractStatus]);

  const filteredPrivateContracts = useMemo(() => {
    if (filterContractStatus === 'all') return privateContracts;
    return privateContracts.filter(c => c.status === filterContractStatus);
  }, [privateContracts, filterContractStatus]);

  // Resumo filtrado
  const filteredContractSummary = useMemo(() => {
    const allFiltered = [...filteredPublicContracts, ...filteredPrivateContracts];
    return {
      totalContractValue: allFiltered.reduce((s, c) => s + c.contract_value, 0),
      totalReceived: allFiltered.reduce((s, c) => s + c.total_received, 0),
      totalToReceive: allFiltered.reduce((s, c) => s + c.amount_to_receive, 0),
      totalPaidDesigners: allFiltered.reduce((s, c) => s + c.total_paid_designers, 0),
      totalToPayDesigners: allFiltered.reduce((s, c) => s + c.amount_to_pay_designers, 0),
      totalExpenses_contratos: allFiltered.reduce((s, c) => s + c.total_expenses, 0),
      totalExpenses_empresa: contractSummary.totalExpenses_empresa || 0,
      count: allFiltered.length
    };
  }, [filteredPublicContracts, filteredPrivateContracts, contractSummary]);

  const loading = paymentsLoading || overviewLoading;

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
          <h1 className="text-3xl font-bold text-foreground">Gestao Financeira</h1>
          <p className="text-muted-foreground">
            Visao geral de pagamentos e valores de projetistas
          </p>
        </div>
        <Button onClick={handleAddPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>
      </motion.div>

      {/* Cards de Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.status === 'pago').length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totals.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.status === 'pendente').length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetistas Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summaryByDesigner.length}
            </div>
            <p className="text-xs text-muted-foreground">
              com pagamentos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totals.totalPaid + totals.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.length} pagamentos
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
            <TabsTrigger value="visao-geral">Visao Geral</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="projetistas">Por Projetista</TabsTrigger>
            <TabsTrigger value="nao-atribuidas" className="relative">
              Nao Atribuidas
              {unassignedPricing.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unassignedPricing.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
          </TabsList>

          {/* Tab Visão Geral de Contratos */}
          <TabsContent value="visao-geral">
            {/* Filtro por Status */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <Label className="font-semibold">Filtrar por Status:</Label>
              <Select value={filterContractStatus} onValueChange={setFilterContractStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                  <SelectItem value="AGUARDANDO_APROVACAO">Aguardando Aprovacao</SelectItem>
                  <SelectItem value="PARALISADO">Paralisado</SelectItem>
                  <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluido</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="ml-auto">
                {filteredContractSummary.count} contratos
              </Badge>
            </div>

            {/* Cards de Resumo dos Contratos - Usando dados filtrados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(filteredContractSummary.totalContractValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredContractSummary.count} contratos
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(filteredContractSummary.totalReceived)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredContractSummary.totalContractValue > 0
                      ? `${((filteredContractSummary.totalReceived / filteredContractSummary.totalContractValue) * 100).toFixed(1)}% do total`
                      : '0% do total'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A Receber</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(filteredContractSummary.totalToReceive)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de contratos filtrados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A Pagar Projetistas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(filteredContractSummary.totalToPayDesigners)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    baseado nas precificacoes
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo (Lucro)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos) >= 0
                      ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recebido - Pago - Despesas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cards de Custos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pago aos Projetistas</CardTitle>
                  <Users className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(filteredContractSummary.totalPaidDesigners)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    total de pagamentos realizados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas Contratos</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(filteredContractSummary.totalExpenses_contratos || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    custos vinculados a projetos
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gray-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas Empresa</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">
                    {formatCurrency(filteredContractSummary.totalExpenses_empresa || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    custos gerais (GERAL)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Contratos Públicos */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default">Publico</Badge>
                  Contratos Publicos
                </CardTitle>
                <CardDescription>
                  {filteredPublicContracts.length} contratos | Total: {formatCurrency(filteredPublicContracts.reduce((s, c) => s + c.contract_value, 0))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Carregando...</p>
                ) : filteredPublicContracts.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Nenhum contrato publico com este status</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Projeto</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor Contrato</TableHead>
                          <TableHead className="text-right">Recebido</TableHead>
                          <TableHead className="text-right">A Receber</TableHead>
                          <TableHead className="text-right">Pago Projetistas</TableHead>
                          <TableHead className="text-right">Despesas</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPublicContracts.map((contract) => {
                          const saldo = contract.total_received - contract.total_paid_designers - contract.total_expenses;
                          return (
                            <TableRow
                              key={contract.project_id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setSelectedContractId(contract.project_id);
                                setIsContractDetailOpen(true);
                              }}
                            >
                              <TableCell className="font-medium">{contract.project_name}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  contract.status === 'CONCLUIDO' ? 'default' :
                                  contract.status === 'EM_ANDAMENTO' ? 'secondary' :
                                  'outline'
                                }>
                                  {contract.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(contract.contract_value)}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(contract.total_received)}
                              </TableCell>
                              <TableCell className="text-right text-yellow-600">
                                {formatCurrency(contract.amount_to_receive)}
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {formatCurrency(contract.total_paid_designers)}
                              </TableCell>
                              <TableCell className="text-right text-purple-600">
                                {formatCurrency(contract.total_expenses)}
                              </TableCell>
                              <TableCell className={`text-right font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(saldo)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Linha de Total */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>TOTAL PUBLICO</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(filteredPublicContracts.reduce((s, c) => s + c.contract_value, 0))}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(filteredPublicContracts.reduce((s, c) => s + c.total_received, 0))}
                          </TableCell>
                          <TableCell className="text-right text-yellow-600">
                            {formatCurrency(filteredPublicContracts.reduce((s, c) => s + c.amount_to_receive, 0))}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(filteredPublicContracts.reduce((s, c) => s + c.total_paid_designers, 0))}
                          </TableCell>
                          <TableCell className="text-right text-purple-600">
                            {formatCurrency(filteredPublicContracts.reduce((s, c) => s + c.total_expenses, 0))}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600">
                            {formatCurrency(filteredPublicContracts.reduce((s, c) => s + (c.total_received - c.total_paid_designers - c.total_expenses), 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela de Contratos Privados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Privado</Badge>
                  Contratos Privados
                </CardTitle>
                <CardDescription>
                  {filteredPrivateContracts.length} contratos | Total: {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + c.contract_value, 0))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Carregando...</p>
                ) : filteredPrivateContracts.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Nenhum contrato privado com este status</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Projeto</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor Contrato</TableHead>
                          <TableHead className="text-right">Recebido</TableHead>
                          <TableHead className="text-right">A Receber</TableHead>
                          <TableHead className="text-right">Pago Projetistas</TableHead>
                          <TableHead className="text-right">Despesas</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPrivateContracts.map((contract) => {
                          const saldo = contract.total_received - contract.total_paid_designers - contract.total_expenses;
                          return (
                            <TableRow
                              key={contract.project_id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                setSelectedContractId(contract.project_id);
                                setIsContractDetailOpen(true);
                              }}
                            >
                              <TableCell className="font-medium">{contract.project_name}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  contract.status === 'CONCLUIDO' ? 'default' :
                                  contract.status === 'EM_ANDAMENTO' ? 'secondary' :
                                  'outline'
                                }>
                                  {contract.status.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(contract.contract_value)}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(contract.total_received)}
                              </TableCell>
                              <TableCell className="text-right text-yellow-600">
                                {formatCurrency(contract.amount_to_receive)}
                              </TableCell>
                              <TableCell className="text-right text-red-600">
                                {formatCurrency(contract.total_paid_designers)}
                              </TableCell>
                              <TableCell className="text-right text-purple-600">
                                {formatCurrency(contract.total_expenses)}
                              </TableCell>
                              <TableCell className={`text-right font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(saldo)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Linha de Total */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>TOTAL PRIVADO</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + c.contract_value, 0))}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + c.total_received, 0))}
                          </TableCell>
                          <TableCell className="text-right text-yellow-600">
                            {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + c.amount_to_receive, 0))}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + c.total_paid_designers, 0))}
                          </TableCell>
                          <TableCell className="text-right text-purple-600">
                            {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + c.total_expenses, 0))}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600">
                            {formatCurrency(filteredPrivateContracts.reduce((s, c) => s + (c.total_received - c.total_paid_designers - c.total_expenses), 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Pagamentos */}
          <TabsContent value="pagamentos">
            <Card>
              <CardHeader>
                <CardTitle>Historico de Pagamentos</CardTitle>
                <CardDescription>Todos os pagamentos registrados no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={filterDesigner} onValueChange={setFilterDesigner}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Projetista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {profiles.filter(p => p.id).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos projetos</SelectItem>
                      {projects.filter(p => p.id).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterSector} onValueChange={setFilterSector}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="privado">Privado</SelectItem>
                      <SelectItem value="publico">Publico</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo periodo</SelectItem>
                      <SelectItem value="30">Ultimos 30 dias</SelectItem>
                      <SelectItem value="60">Ultimos 60 dias</SelectItem>
                      <SelectItem value="90">Ultimos 90 dias</SelectItem>
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
                        placeholder="Data inicio"
                      />
                      <Input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-[140px]"
                        placeholder="Data fim"
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
                          <TableHead className="text-right">Acoes</TableHead>
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
                                {payment.sector === 'publico' ? 'Publico' : 'Privado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === 'pago' ? 'default' :
                                  payment.status === 'pendente' ? 'secondary' : 'destructive'
                                }
                                className={payment.status === 'pago' ? 'bg-green-500' : ''}
                              >
                                {payment.status === 'pago' ? 'Pago' :
                                 payment.status === 'pendente' ? 'Pendente' : 'Cancelado'}
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
                <CardDescription>Visao consolidada de cada projetista</CardDescription>
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
                        <TableHead>Ultimo Pagamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryByDesigner.map((item) => (
                        <TableRow key={item.designer_id}>
                          <TableCell className="font-medium">{item.designer_name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.designer_email}</TableCell>
                          <TableCell className="text-right">{item.total_payments}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(item.total_received)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-yellow-600">
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
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Precificacoes Nao Atribuidas</CardTitle>
                </div>
                <CardDescription>
                  Disciplinas precificadas sem projetista designado. Atribua um projetista para que apareca no financeiro dele.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unassignedPricing.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium text-green-600">Tudo certo!</p>
                    <p>Todas as precificacoes tem projetista atribuido.</p>
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
                        <TableRow key={item.id} className="bg-yellow-50">
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
                                    title: 'Projetista atribuido!',
                                    description: `Disciplina ${item.discipline_name} atribuida com sucesso.`,
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Erro',
                                    description: 'Nao foi possivel atribuir o projetista.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {profiles.map((p) => (
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
                  <SelectItem value="publico">Publico</SelectItem>
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
                  <CardTitle className="text-sm font-medium">Despesas Publico</CardTitle>
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
                    {filteredExpensesSummary.countPublico + filteredExpensesSummary.countPrivado} despesas totais
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Despesas por Centro de Custo - Clicável */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Despesas por Centro de Custo (clique para filtrar)</CardTitle>
              </CardHeader>
              <CardContent>
                {expensesSummary.byCostCenter.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma despesa cadastrada</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expensesSummary.byCostCenter.map((cat) => (
                      <button
                        key={cat.cost_center}
                        onClick={() => setFilterExpenseCostCenter(
                          filterExpenseCostCenter === cat.cost_center ? 'all' : cat.cost_center
                        )}
                        className={`flex justify-between items-center p-3 rounded-lg transition-colors cursor-pointer text-left w-full ${
                          filterExpenseCostCenter === cat.cost_center
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{cat.cost_center}</p>
                          <p className={`text-xs ${filterExpenseCostCenter === cat.cost_center ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {cat.count} registros
                          </p>
                        </div>
                        <span className="font-bold">{formatCurrency(cat.total)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela Única de Despesas Filtradas */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {filterExpenseSector === 'publico' ? 'Despesas Setor Público' :
                   filterExpenseSector === 'privado' ? 'Despesas Setor Privado' :
                   'Todas as Despesas'}
                </CardTitle>
                <CardDescription>{filteredExpenses.length} registros</CardDescription>
              </CardHeader>
              <CardContent>
                {expensesLoading ? (
                  <p>Carregando...</p>
                ) : filteredExpenses.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma despesa com os filtros selecionados</p>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descricao</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead>Contrato</TableHead>
                          <TableHead>Centro de Custo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="whitespace-nowrap">{formatDate(expense.expense_date)}</TableCell>
                            <TableCell className="max-w-[250px]">{expense.description}</TableCell>
                            <TableCell>
                              <Badge variant={expense.sector === 'publico' ? 'default' : 'secondary'}>
                                {expense.sector === 'publico' ? 'Publico' : 'Privado'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => setFilterExpenseContract(
                                  filterExpenseContract === expense.contract_name ? 'all' : expense.contract_name
                                )}
                                className="cursor-pointer"
                              >
                                <Badge
                                  variant={filterExpenseContract === expense.contract_name ? 'default' : 'secondary'}
                                  className="hover:opacity-80"
                                >
                                  {expense.project_name || expense.contract_name || 'GERAL'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => setFilterExpenseCostCenter(
                                  filterExpenseCostCenter === expense.cost_center ? 'all' : expense.cost_center
                                )}
                                className="cursor-pointer"
                              >
                                <Badge
                                  variant={filterExpenseCostCenter === expense.cost_center ? 'default' : 'outline'}
                                  className="hover:opacity-80"
                                >
                                  {expense.cost_center || 'Outros'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className={`text-right font-medium whitespace-nowrap ${
                              expense.sector === 'publico' ? 'text-red-600' : 'text-orange-600'
                            }`}>
                              {formatCurrency(expense.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Linha de Total */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={5}>TOTAL</TableCell>
                          <TableCell className="text-right text-purple-600">
                            {formatCurrency(filteredExpensesSummary.totalGeral)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  )}
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal de Pagamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Editar Pagamento' : 'Registrar Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? 'Altere os dados do pagamento'
                : 'Registre um novo pagamento para um projetista'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Projetista */}
              <div className="space-y-2">
                <Label>Projetista *</Label>
                <Select
                  value={formData.designer_id}
                  onValueChange={(value) => setFormData({ ...formData, designer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.filter(p => p.id).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disciplina */}
              <div className="space-y-2">
                <Label>Disciplina *</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(value) => setFormData({ ...formData, discipline: value, newDiscipline: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Nova disciplina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campo para nova disciplina */}
            {formData.discipline === '__new__' && (
              <div className="space-y-2">
                <Label>Nome da Nova Disciplina *</Label>
                <Input
                  value={formData.newDiscipline}
                  onChange={(e) => setFormData({ ...formData, newDiscipline: e.target.value })}
                  placeholder="Digite o nome da disciplina"
                />
              </div>
            )}

            {/* Projeto */}
            <div className="space-y-2">
              <Label>Projeto (opcional)</Label>
              <Select
                value={formData.project_id || 'none'}
                onValueChange={(value) => {
                  const actualValue = value === 'none' ? '' : value;
                  setFormData({
                    ...formData,
                    project_id: actualValue
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects.filter(p => p.id).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0,00"
                />
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label>Data do Pagamento *</Label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Setor */}
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(value: 'privado' | 'publico') => setFormData({ ...formData, sector: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privado">Privado</SelectItem>
                    <SelectItem value="publico">Publico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'pendente' | 'pago' | 'cancelado') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descricao */}
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Observacoes adicionais..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSavePayment}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmacao de Delete */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este pagamento?
              Esta acao nao pode ser desfeita.
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
        onOpenChange={setIsContractDetailOpen}
      />
    </div>
  );
};

export default AdminFinanceiro;
