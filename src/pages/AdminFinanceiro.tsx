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
  Search
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
  useAdminFinancialOverview
} from '@/hooks/useDesignerFinancials';
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
  project_name: string;
  designer_id: string;
  discipline: string;
  amount: number;
  payment_date: string;
  description: string;
  sector: 'privado' | 'publico';
  invoice_number: string;
  contract_reference: string;
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
  const { toast } = useToast();

  // Estados
  const [activeTab, setActiveTab] = useState('pagamentos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DesignerPayment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  // Filtros
  const [filterDesigner, setFilterDesigner] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form data
  const [formData, setFormData] = useState<PaymentFormData>({
    project_id: '',
    project_name: '',
    designer_id: '',
    discipline: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    sector: 'privado',
    invoice_number: '',
    contract_reference: '',
    status: 'pago'
  });

  // Verificar se usuario e admin
  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Acesso restrito a administradores</p>
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
  }, [payments, filterDesigner, filterSector, filterPeriod, customDateStart, customDateEnd, searchTerm]);

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
      project_name: '',
      designer_id: '',
      discipline: '',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      description: '',
      sector: 'privado',
      invoice_number: '',
      contract_reference: '',
      status: 'pago'
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditPayment = (payment: DesignerPayment) => {
    setEditingPayment(payment);
    setFormData({
      project_id: payment.project_id || '',
      project_name: payment.project_name || '',
      designer_id: payment.designer_id,
      discipline: payment.discipline,
      amount: payment.amount,
      payment_date: payment.payment_date,
      description: payment.description || '',
      sector: payment.sector,
      invoice_number: payment.invoice_number || '',
      contract_reference: payment.contract_reference || '',
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

      if (!formData.discipline) {
        toast({
          title: 'Disciplina obrigatoria',
          description: 'Selecione uma disciplina',
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
      let projectName = formData.project_name;
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
        discipline: formData.discipline,
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        sector: formData.sector,
        status: formData.status
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (projectId) dataToSave.project_id = projectId;
      if (projectName) dataToSave.project_name = projectName;
      if (formData.description?.trim()) dataToSave.description = formData.description;
      if (formData.invoice_number?.trim()) dataToSave.invoice_number = formData.invoice_number;
      if (formData.contract_reference?.trim()) dataToSave.contract_reference = formData.contract_reference;
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
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="projetistas">Por Projetista</TabsTrigger>
          </TabsList>

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
                  onValueChange={(value) => setFormData({ ...formData, discipline: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Projeto */}
            <div className="space-y-2">
              <Label>Projeto (opcional)</Label>
              <Select
                value={formData.project_id || 'none'}
                onValueChange={(value) => {
                  const actualValue = value === 'none' ? '' : value;
                  const project = projects.find(p => p.id === actualValue);
                  setFormData({
                    ...formData,
                    project_id: actualValue,
                    project_name: project?.name || ''
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

            {/* Nome do Projeto (para projetos historicos) */}
            {!formData.project_id && (
              <div className="space-y-2">
                <Label>Nome do Projeto (manual)</Label>
                <Input
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="Ex: CELESC-RS"
                />
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4">
              {/* Nota Fiscal */}
              <div className="space-y-2">
                <Label>Numero da Nota</Label>
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  placeholder="NF-001"
                />
              </div>

              {/* Referencia Contrato */}
              <div className="space-y-2">
                <Label>Referencia Contrato</Label>
                <Input
                  value={formData.contract_reference}
                  onChange={(e) => setFormData({ ...formData, contract_reference: e.target.value })}
                  placeholder="CT-2024-001"
                />
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
    </div>
  );
};

export default AdminFinanceiro;
