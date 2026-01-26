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
  UserPlus,
  FileCheck,
  Calendar,
  ArrowUpRight
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
  status: 'pago' | 'pendente' | 'cancelado';
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
    income: contractIncome,
    createIncome,
    updateIncome,
    deleteIncome,
    refetch: refetchIncome
  } = useContractIncome();
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

  // Estados para modal de Receitas
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);
  const [isDeleteIncomeDialogOpen, setIsDeleteIncomeDialogOpen] = useState(false);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [incomeFormData, setIncomeFormData] = useState({
    project_id: '',
    amount: 0,
    income_date: new Date().toISOString().split('T')[0],
    description: '',
    income_type: 'medicao' as 'medicao' | 'entrada' | 'parcela' | 'outro'
  });

  // Filtros
  const [filterDesigner, setFilterDesigner] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterContractStatus, setFilterContractStatus] = useState<string[]>(['EM_ANDAMENTO']); // Filtro de status para Visão Geral (multi-seleção)
  const [filterContractType, setFilterContractType] = useState<string>('all'); // Filtro por tipo (publico/privado)
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]); // Multi-seleção de contratos
  const [cardDetailType, setCardDetailType] = useState<string | null>(null); // Tipo de card a detalhar
  // Filtros de Despesas
  const [filterExpenseCostCenter, setFilterExpenseCostCenter] = useState<string>('all');
  const [filterExpenseContract, setFilterExpenseContract] = useState<string>('all');
  const [filterExpenseSector, setFilterExpenseSector] = useState<string>('all');
  // Filtros de Receitas
  const [filterIncomeType, setFilterIncomeType] = useState<string>('all');
  const [filterIncomeProject, setFilterIncomeProject] = useState<string>('all');
  const [filterIncomeSector, setFilterIncomeSector] = useState<string>('all');
  const [expensesExpanded, setExpensesExpanded] = useState<boolean>(false);
  const [incomeExpanded, setIncomeExpanded] = useState<boolean>(false);
  const INITIAL_ROWS_LIMIT = 20; // Mostrar 20 primeiras, depois expandir
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

  // Dados enriquecidos de receitas (com nome do projeto)
  const enrichedIncome = useMemo(() => {
    return contractIncome.map(inc => {
      const project = projects.find(p => p.id === inc.project_id);
      return {
        ...inc,
        project_name: project?.name || 'N/A',
        sector: project?.type || 'privado'
      };
    });
  }, [contractIncome, projects]);

  // Filtrar e calcular resumo de receitas
  const incomeSummary = useMemo(() => {
    const filtered = enrichedIncome.filter(inc => {
      if (filterIncomeType !== 'all' && inc.income_type !== filterIncomeType) return false;
      if (filterIncomeProject !== 'all' && inc.project_id !== filterIncomeProject) return false;
      if (filterIncomeSector !== 'all' && inc.sector !== filterIncomeSector) return false;
      return true;
    }).sort((a, b) => new Date(b.income_date).getTime() - new Date(a.income_date).getTime());

    const medicoes = filtered.filter(i => i.income_type === 'medicao');
    const parcelas = filtered.filter(i => i.income_type === 'parcela');
    const entradas = filtered.filter(i => i.income_type === 'entrada');
    const outros = filtered.filter(i => !['medicao', 'parcela', 'entrada'].includes(i.income_type || ''));

    return {
      total: filtered.reduce((sum, inc) => sum + Number(inc.amount), 0),
      medicoes: {
        total: medicoes.reduce((s, i) => s + Number(i.amount), 0),
        count: medicoes.length
      },
      parcelas: {
        total: parcelas.reduce((s, i) => s + Number(i.amount), 0),
        count: parcelas.length
      },
      entradas: {
        total: entradas.reduce((s, i) => s + Number(i.amount), 0),
        count: entradas.length
      },
      outros: {
        total: outros.reduce((s, i) => s + Number(i.amount), 0),
        count: outros.length
      },
      count: filtered.length,
      items: filtered
    };
  }, [enrichedIncome, filterIncomeType, filterIncomeProject, filterIncomeSector]);

  // Projetos com receitas (para filtro)
  const projectsWithIncome = useMemo(() => {
    const projectIds = [...new Set(contractIncome.map(i => i.project_id).filter(Boolean))];
    return projects.filter(p => projectIds.includes(p.id));
  }, [contractIncome, projects]);

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

  // ============ HANDLERS DE RECEITAS ============

  // Abrir modal para nova receita
  const handleAddIncome = () => {
    setEditingIncome(null);
    setIncomeFormData({
      project_id: '',
      amount: 0,
      income_date: new Date().toISOString().split('T')[0],
      description: '',
      income_type: 'medicao'
    });
    setIsIncomeModalOpen(true);
  };

  // Abrir modal para editar receita
  const handleEditIncome = (income: any) => {
    setEditingIncome(income);
    setIncomeFormData({
      project_id: income.project_id || '',
      amount: income.amount,
      income_date: income.income_date,
      description: income.description || '',
      income_type: income.income_type || 'medicao'
    });
    setIsIncomeModalOpen(true);
  };

  // Confirmar delete de receita
  const handleDeleteIncomeClick = (id: string) => {
    setDeletingIncomeId(id);
    setIsDeleteIncomeDialogOpen(true);
  };

  // Executar delete de receita
  const handleConfirmDeleteIncome = async () => {
    if (!deletingIncomeId) return;

    try {
      const result = await deleteIncome(deletingIncomeId);
      if (result.success) {
        toast({
          title: 'Receita removida',
          description: 'A receita foi removida com sucesso'
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsDeleteIncomeDialogOpen(false);
      setDeletingIncomeId(null);
    }
  };

  // Salvar receita (criar ou atualizar)
  const handleSaveIncome = async () => {
    try {
      // Validar projeto
      if (!incomeFormData.project_id) {
        toast({
          title: 'Projeto obrigatório',
          description: 'Selecione um projeto',
          variant: 'destructive'
        });
        return;
      }

      // Validar valor
      if (incomeFormData.amount <= 0) {
        toast({
          title: 'Valor inválido',
          description: 'O valor deve ser maior que zero',
          variant: 'destructive'
        });
        return;
      }

      const dataToSave = {
        project_id: incomeFormData.project_id,
        amount: Number(incomeFormData.amount),
        income_date: incomeFormData.income_date,
        description: incomeFormData.description || null,
        income_type: incomeFormData.income_type
      };

      if (editingIncome) {
        const result = await updateIncome(editingIncome.id, dataToSave);
        if (result.success) {
          toast({
            title: 'Receita atualizada',
            description: 'A receita foi atualizada com sucesso'
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await createIncome(dataToSave);
        if (result.success) {
          toast({
            title: 'Receita registrada',
            description: 'A receita foi registrada com sucesso'
          });
        } else {
          throw new Error(result.error);
        }
      }

      setIsIncomeModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro desconhecido ao salvar receita',
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

  // Filtrar contratos por status, tipo e seleção
  const filteredContracts = useMemo(() => {
    // Sempre excluir EM_ESPERA (contratos que ainda não iniciaram)
    let filtered = allContracts.filter(c => c.status !== 'EM_ESPERA');

    // Filtro por status (multi-seleção)
    if (filterContractStatus.length > 0 && !filterContractStatus.includes('all')) {
      filtered = filtered.filter(c => filterContractStatus.includes(c.status));
    }

    // Filtro por tipo (público/privado)
    if (filterContractType !== 'all') {
      filtered = filtered.filter(c => c.type === filterContractType);
    }

    // Filtro por contratos selecionados (multi-seleção)
    if (selectedContracts.length > 0) {
      filtered = filtered.filter(c => selectedContracts.includes(c.project_id));
    }

    return filtered;
  }, [allContracts, filterContractStatus, filterContractType, selectedContracts]);

  // Separar filtrados por tipo para exibição
  const filteredPublicContracts = useMemo(() =>
    filteredContracts.filter(c => c.type === 'publico'),
    [filteredContracts]
  );

  const filteredPrivateContracts = useMemo(() =>
    filteredContracts.filter(c => c.type === 'privado'),
    [filteredContracts]
  );

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

  // Toggle seleção de contrato (para multi-seleção)
  const toggleContractSelection = (projectId: string) => {
    setSelectedContracts(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

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
          <TabsList className="flex-wrap">
            <TabsTrigger value="visao-geral">Visao Geral</TabsTrigger>
            <TabsTrigger value="receitas" className="relative">
              Receitas
              {contractIncome.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 flex items-center justify-center text-xs">
                  {contractIncome.length}
                </Badge>
              )}
            </TabsTrigger>
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
            {/* Filtros Avançados */}
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
              <Label className="font-semibold">Filtros:</Label>

              {/* Filtro por Tipo */}
              <Select value={filterContractType} onValueChange={setFilterContractType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="publico">Publico</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Status (Multi-seleção) */}
              <div className="flex flex-wrap gap-3 items-center">
                <Label className="text-sm">Status: <span className="text-xs text-muted-foreground font-normal">(selecione vários)</span></Label>
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguard. Pagamento' },
                  { value: 'AGUARDANDO_APROVACAO', label: 'Aguard. Aprovacao' },
                  { value: 'PARALISADO', label: 'Paralisado' },
                  { value: 'CONCLUIDO', label: 'Concluido' }
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
                            // Remove 'all' se estava selecionado e adiciona o novo status
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

              {/* Limpar Filtros */}
              {(filterContractType !== 'all' || (filterContractStatus.length !== 1 || filterContractStatus[0] !== 'EM_ANDAMENTO') || selectedContracts.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterContractType('all');
                    setFilterContractStatus(['EM_ANDAMENTO']);
                    setSelectedContracts([]);
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

            {/* Multi-seleção de Contratos */}
            <div className="mb-6">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Clique nos contratos abaixo para filtrar (Ctrl+Click para multi-seleção):
              </Label>
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-2 bg-muted/20 rounded-lg">
                {allContracts
                  .filter(c => filterContractStatus.includes('all') || filterContractStatus.length === 0 || filterContractStatus.includes(c.status))
                  .filter(c => filterContractType === 'all' || c.type === filterContractType)
                  .map(contract => (
                  <Badge
                    key={contract.project_id}
                    variant={selectedContracts.includes(contract.project_id) ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleContractSelection(contract.project_id)}
                  >
                    {contract.project_name}
                    {selectedContracts.includes(contract.project_id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedContracts.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedContracts.length} contrato(s) selecionado(s)
                </p>
              )}
            </div>

            {/* Cards de Resumo dos Contratos - Usando dados filtrados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card
                className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('totalContratos')}
              >
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

              <Card
                className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('totalRecebido')}
              >
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

              <Card
                className="border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('aReceber')}
              >
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

              <Card
                className="border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('aPagar')}
              >
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

              <Card
                className="border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('saldo')}
              >
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
              <Card
                className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('pagoProjetistas')}
              >
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

              <Card
                className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('despesasContratos')}
              >
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

              <Card
                className="border-l-4 border-l-gray-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCardDetailType('despesasEmpresa')}
              >
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
                              <TableCell className="font-medium">
                                <div>{contract.project_name}</div>
                                {contract.client && (
                                  <div className="text-xs text-muted-foreground">{contract.client}</div>
                                )}
                              </TableCell>
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
                              <TableCell className={`text-right font-bold whitespace-nowrap ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
                              <TableCell className="font-medium">
                                <div>{contract.project_name}</div>
                                {contract.client && (
                                  <div className="text-xs text-muted-foreground">{contract.client}</div>
                                )}
                              </TableCell>
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
                              <TableCell className={`text-right font-bold whitespace-nowrap ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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

          {/* Tab Receitas */}
          <TabsContent value="receitas">
            {/* Card de Total de Receitas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(incomeSummary.total)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botão Nova Receita + Filtros */}
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
              <Button onClick={handleAddIncome} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Receita
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <Label className="font-semibold">Filtros:</Label>

              {/* Filtro por Projeto */}
              <Select value={filterIncomeProject} onValueChange={setFilterIncomeProject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  {projectsWithIncome.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Setor */}
              <Select value={filterIncomeSector} onValueChange={setFilterIncomeSector}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                </SelectContent>
              </Select>

              {/* Limpar Filtros */}
              {(filterIncomeProject !== 'all' || filterIncomeSector !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterIncomeProject('all');
                    setFilterIncomeSector('all');
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}

              <Badge variant="outline" className="ml-auto">
                {formatCurrency(incomeSummary.total)}
              </Badge>
            </div>

            {/* Tabela de Receitas */}
            <Card>
              <CardHeader>
                <CardTitle>Todas as Receitas</CardTitle>
                <CardDescription>
                  Histórico de recebimentos e entradas financeiras
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incomeSummary.items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma receita encontrada com os filtros selecionados</p>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Projeto</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-center w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(incomeExpanded ? incomeSummary.items : incomeSummary.items.slice(0, INITIAL_ROWS_LIMIT)).map((income) => (
                          <TableRow key={income.id}>
                            <TableCell className="whitespace-nowrap">{formatDate(income.income_date)}</TableCell>
                            <TableCell>
                              <button
                                onClick={() => setFilterIncomeProject(
                                  filterIncomeProject === income.project_id ? 'all' : income.project_id
                                )}
                                className="cursor-pointer"
                              >
                                <Badge
                                  variant={filterIncomeProject === income.project_id ? 'default' : 'secondary'}
                                  className="hover:opacity-80"
                                >
                                  {income.project_name}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="max-w-[250px]">{income.description || '-'}</TableCell>
                            <TableCell>
                              <button
                                onClick={() => setFilterIncomeSector(
                                  filterIncomeSector === income.sector ? 'all' : income.sector
                                )}
                                className="cursor-pointer"
                              >
                                <Badge
                                  variant={income.sector === 'publico' ? 'default' : 'secondary'}
                                  className="hover:opacity-80"
                                >
                                  {income.sector === 'publico' ? 'Público' : 'Privado'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600 whitespace-nowrap">
                              {formatCurrency(income.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditIncome(income)}
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteIncomeClick(income.id)}
                                  title="Excluir"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Linha de Total */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={4}>TOTAL</TableCell>
                          <TableCell className="text-right text-emerald-600">
                            {formatCurrency(incomeSummary.total)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Botão Expandir/Recolher Receitas */}
                {incomeSummary.items.length > INITIAL_ROWS_LIMIT && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setIncomeExpanded(!incomeExpanded)}
                    >
                      {incomeExpanded
                        ? `Mostrar menos (${INITIAL_ROWS_LIMIT} itens)`
                        : `Mostrar todos (${incomeSummary.items.length} itens)`}
                    </Button>
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
                  <div className="overflow-x-auto border rounded-lg">
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
                        {(expensesExpanded ? filteredExpenses : filteredExpenses.slice(0, INITIAL_ROWS_LIMIT)).map((expense) => (
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
                {/* Botão Expandir/Recolher */}
                {filteredExpenses.length > INITIAL_ROWS_LIMIT && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setExpensesExpanded(!expensesExpanded)}
                    >
                      {expensesExpanded
                        ? `Mostrar menos (${INITIAL_ROWS_LIMIT} itens)`
                        : `Mostrar todos (${filteredExpenses.length} itens)`}
                    </Button>
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
                  onValueChange={(value: 'pago' | 'cancelado') => setFormData({ ...formData, status: value })}
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

      {/* Modal de Receita (criar/editar) */}
      <Dialog open={isIncomeModalOpen} onOpenChange={setIsIncomeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Editar Receita' : 'Nova Receita'}
            </DialogTitle>
            <DialogDescription>
              {editingIncome
                ? 'Altere os dados da receita'
                : 'Registre uma nova receita (medição, parcela, entrada, etc.)'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Projeto */}
            <div className="space-y-2">
              <Label>Projeto *</Label>
              <Select
                value={incomeFormData.project_id}
                onValueChange={(value) => setIncomeFormData({ ...incomeFormData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.id && !p.is_archived).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Receita */}
            <div className="space-y-2">
              <Label>Tipo de Receita *</Label>
              <Select
                value={incomeFormData.income_type}
                onValueChange={(value: 'medicao' | 'entrada' | 'parcela' | 'outro') =>
                  setIncomeFormData({ ...incomeFormData, income_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicao">Medição</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="parcela">Parcela</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
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
                  value={incomeFormData.amount || ''}
                  onChange={(e) => setIncomeFormData({
                    ...incomeFormData,
                    amount: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0,00"
                />
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={incomeFormData.income_date}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, income_date: e.target.value })}
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={incomeFormData.description}
                onChange={(e) => setIncomeFormData({ ...incomeFormData, description: e.target.value })}
                placeholder="Ex: Medição 3/5, Entrada 30%, etc."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIncomeModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveIncome}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Delete de Receita */}
      <AlertDialog open={isDeleteIncomeDialogOpen} onOpenChange={setIsDeleteIncomeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta receita?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteIncome} className="bg-destructive text-destructive-foreground">
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

      {/* Modal de Detalhamento dos Cards */}
      <Dialog open={!!cardDetailType} onOpenChange={(open) => !open && setCardDetailType(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {cardDetailType === 'totalContratos' && 'Detalhamento: Total de Contratos'}
              {cardDetailType === 'totalRecebido' && 'Detalhamento: Total Recebido'}
              {cardDetailType === 'aReceber' && 'Detalhamento: Valores a Receber'}
              {cardDetailType === 'aPagar' && 'Detalhamento: A Pagar Projetistas'}
              {cardDetailType === 'saldo' && 'Detalhamento: Saldo (Lucro)'}
              {cardDetailType === 'pagoProjetistas' && 'Detalhamento: Pago aos Projetistas'}
              {cardDetailType === 'despesasContratos' && 'Detalhamento: Despesas de Contratos'}
              {cardDetailType === 'despesasEmpresa' && 'Detalhamento: Despesas da Empresa'}
            </DialogTitle>
            <DialogDescription>
              Como esse valor foi calculado
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Total de Contratos */}
            {cardDetailType === 'totalContratos' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalContractValue)}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((c) => (
                      <TableRow key={c.project_id}>
                        <TableCell className="font-medium">{c.project_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>
                            {c.type === 'publico' ? 'Público' : 'Privado'}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.status.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(c.contract_value)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3}>TOTAL</TableCell>
                      <TableCell className="text-right text-blue-600">
                        {formatCurrency(filteredContractSummary.totalContractValue)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Total Recebido */}
            {cardDetailType === 'totalRecebido' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-green-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalReceived)}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor Contrato</TableHead>
                      <TableHead className="text-right">Recebido</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.filter(c => c.total_received > 0).map((c) => (
                      <TableRow key={c.project_id}>
                        <TableCell className="font-medium">{c.project_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>
                            {c.type === 'publico' ? 'Público' : 'Privado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(c.contract_value)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(c.total_received)}
                        </TableCell>
                        <TableCell className="text-right">
                          {((c.total_received / c.contract_value) * 100).toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3}>TOTAL</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(filteredContractSummary.totalReceived)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* A Receber */}
            {cardDetailType === 'aReceber' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-yellow-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalToReceive)}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor Contrato</TableHead>
                      <TableHead className="text-right">Recebido</TableHead>
                      <TableHead className="text-right">A Receber</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.filter(c => c.amount_to_receive > 0).map((c) => (
                      <TableRow key={c.project_id}>
                        <TableCell className="font-medium">{c.project_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>
                            {c.type === 'publico' ? 'Público' : 'Privado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(c.contract_value)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(c.total_received)}</TableCell>
                        <TableCell className="text-right font-semibold text-yellow-600">
                          {formatCurrency(c.amount_to_receive)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={4}>TOTAL</TableCell>
                      <TableCell className="text-right text-yellow-600">
                        {formatCurrency(filteredContractSummary.totalToReceive)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* A Pagar Projetistas */}
            {cardDetailType === 'aPagar' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-orange-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalToPayDesigners)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Valores baseados nas precificações cadastradas (Valor Projetista - Já Pago)
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor Projetista</TableHead>
                      <TableHead className="text-right">Já Pago</TableHead>
                      <TableHead className="text-right">A Pagar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.filter(c => c.amount_to_pay_designers > 0).map((c) => (
                      <TableRow key={c.project_id}>
                        <TableCell className="font-medium">{c.project_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>
                            {c.type === 'publico' ? 'Público' : 'Privado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(c.total_paid_designers + c.amount_to_pay_designers)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(c.total_paid_designers)}</TableCell>
                        <TableCell className="text-right font-semibold text-orange-600">
                          {formatCurrency(c.amount_to_pay_designers)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={4}>TOTAL</TableCell>
                      <TableCell className="text-right text-orange-600">
                        {formatCurrency(filteredContractSummary.totalToPayDesigners)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Saldo */}
            {cardDetailType === 'saldo' && (
              <div className="space-y-4">
                <div className={`text-2xl font-bold mb-4 ${
                  (filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos) >= 0
                    ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  Total: {formatCurrency(filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos)}
                </div>
                <Card className="p-4 bg-muted/30">
                  <h4 className="font-semibold mb-2">Formula do Calculo:</h4>
                  <p className="text-lg">
                    <span className="text-green-600">{formatCurrency(filteredContractSummary.totalReceived)}</span>
                    <span className="mx-2">-</span>
                    <span className="text-red-600">{formatCurrency(filteredContractSummary.totalPaidDesigners)}</span>
                    <span className="mx-2">-</span>
                    <span className="text-purple-600">{formatCurrency(filteredContractSummary.totalExpenses_contratos)}</span>
                    <span className="mx-2">=</span>
                    <span className={`font-bold ${
                      (filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos) >= 0
                        ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(filteredContractSummary.totalReceived - filteredContractSummary.totalPaidDesigners - filteredContractSummary.totalExpenses_contratos)}
                    </span>
                  </p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p><span className="text-green-600 font-medium">Total Recebido:</span> {formatCurrency(filteredContractSummary.totalReceived)}</p>
                    <p><span className="text-red-600 font-medium">(-) Pago Projetistas:</span> {formatCurrency(filteredContractSummary.totalPaidDesigners)}</p>
                    <p><span className="text-purple-600 font-medium">(-) Despesas Contratos:</span> {formatCurrency(filteredContractSummary.totalExpenses_contratos)}</p>
                  </div>
                </Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead className="text-right">Recebido</TableHead>
                      <TableHead className="text-right">Pago</TableHead>
                      <TableHead className="text-right">Despesas</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((c) => {
                      const saldo = c.total_received - c.total_paid_designers - c.total_expenses;
                      return (
                        <TableRow key={c.project_id}>
                          <TableCell className="font-medium">{c.project_name}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(c.total_received)}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(c.total_paid_designers)}</TableCell>
                          <TableCell className="text-right text-purple-600">{formatCurrency(c.total_expenses)}</TableCell>
                          <TableCell className={`text-right font-semibold whitespace-nowrap ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(saldo)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pago aos Projetistas */}
            {cardDetailType === 'pagoProjetistas' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-red-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalPaidDesigners)}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.filter(c => c.total_paid_designers > 0).map((c) => (
                      <TableRow key={c.project_id}>
                        <TableCell className="font-medium">{c.project_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>
                            {c.type === 'publico' ? 'Público' : 'Privado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(c.total_paid_designers)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={2}>TOTAL</TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(filteredContractSummary.totalPaidDesigners)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Despesas Contratos */}
            {cardDetailType === 'despesasContratos' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-purple-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalExpenses_contratos)}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Despesas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.filter(c => c.total_expenses > 0).map((c) => (
                      <TableRow key={c.project_id}>
                        <TableCell className="font-medium">{c.project_name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === 'publico' ? 'default' : 'secondary'}>
                            {c.type === 'publico' ? 'Público' : 'Privado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-purple-600">
                          {formatCurrency(c.total_expenses)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={2}>TOTAL</TableCell>
                      <TableCell className="text-right text-purple-600">
                        {formatCurrency(filteredContractSummary.totalExpenses_contratos)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Despesas Empresa */}
            {cardDetailType === 'despesasEmpresa' && (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-gray-600 mb-4">
                  Total: {formatCurrency(filteredContractSummary.totalExpenses_empresa)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Despesas marcadas como "GERAL" ou sem projeto vinculado.
                  Para ver detalhes, acesse a aba "Despesas".
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinanceiro;
