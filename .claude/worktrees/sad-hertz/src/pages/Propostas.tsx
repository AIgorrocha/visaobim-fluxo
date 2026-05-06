import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Calendar, DollarSign, Lock, Edit, User, Archive, Filter, Search,
  TrendingUp, BarChart3, Clock, CheckCircle, XCircle, AlertCircle, Eye, ExternalLink,
  Target, Briefcase, Users, ChevronDown, ChevronUp, SortAsc, SortDesc, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Proposal } from '@/types';
import ProposalModal from '@/components/ProposalModal';

interface ProposalWithActions extends Proposal {
  daysUntilFollowup?: number;
  overdue?: boolean;
  isUrgent?: boolean;
}

const Propostas = () => {
  const { user, profile } = useAuth();
  const { proposals, updateProposal, deleteProposal, refetchProposals } = useSupabaseData();

  // Verificar se usuario e Igor (acesso restrito)
  const allowedEmails = ['igor@visaobim.com'];
  const hasAccess = user && profile && allowedEmails.includes(profile.email?.toLowerCase() || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('proposal_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'analytics'>('kanban');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [proposalModalMode, setProposalModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const isAdmin = profile?.role === 'admin';

  // Bloquear acesso se nao for Igor ou Stael
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Acesso restrito</p>
      </div>
    );
  }

  // Enhanced proposal calculations with follow-up tracking
  const enhancedProposals: ProposalWithActions[] = useMemo(() => {
    return proposals.map((proposal: Proposal) => {
      const now = new Date();
      let daysUntilFollowup: number | undefined;
      let overdue = false;
      let isUrgent = false;

      if (proposal.followup_date) {
        const followupDate = new Date(proposal.followup_date);
        const timeDiff = followupDate.getTime() - now.getTime();
        daysUntilFollowup = Math.ceil(timeDiff / (1000 * 3600 * 24));
        overdue = daysUntilFollowup < 0;
        isUrgent = daysUntilFollowup <= 3 && daysUntilFollowup >= 0;
      }

      return {
        ...proposal,
        daysUntilFollowup,
        overdue,
        isUrgent
      };
    });
  }, [proposals]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalValue = enhancedProposals.reduce((sum, p) => sum + p.proposal_value, 0);
    const approvedValue = enhancedProposals
      .filter(p => p.status === 'aprovada')
      .reduce((sum, p) => sum + p.proposal_value, 0);
    const pendingValue = enhancedProposals
      .filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + p.proposal_value, 0);
    const negotiatingValue = enhancedProposals
      .filter(p => p.status === 'negociando')
      .reduce((sum, p) => sum + p.proposal_value, 0);

    const conversionRate = enhancedProposals.length > 0
      ? (enhancedProposals.filter(p => p.status === 'aprovada').length / enhancedProposals.length) * 100
      : 0;

    const urgentFollowUps = enhancedProposals.filter(p => p.isUrgent).length;
    const overdueFollowUps = enhancedProposals.filter(p => p.overdue).length;

    const avgValue = enhancedProposals.length > 0 ? totalValue / enhancedProposals.length : 0;

    return {
      totalProposals: enhancedProposals.length,
      totalValue,
      approvedValue,
      pendingValue,
      negotiatingValue,
      conversionRate,
      urgentFollowUps,
      overdueFollowUps,
      avgValue,
      statusCounts: {
        pendente: enhancedProposals.filter(p => p.status === 'pendente').length,
        negociando: enhancedProposals.filter(p => p.status === 'negociando').length,
        aprovada: enhancedProposals.filter(p => p.status === 'aprovada').length,
        rejeitada: enhancedProposals.filter(p => p.status === 'rejeitada').length,
      }
    };
  }, [enhancedProposals]);

  // Filter and sort proposals
  const filteredAndSortedProposals = useMemo(() => {
    const filtered = enhancedProposals.filter(proposal => {
      const matchesSearch = proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
      const matchesArchived = showArchived ? true : !proposal.is_archived;
      return matchesSearch && matchesStatus && matchesArchived;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ProposalWithActions];
      let bValue: any = b[sortBy as keyof ProposalWithActions];

      if (sortBy === 'proposal_value') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortBy.includes('date')) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [enhancedProposals, searchTerm, statusFilter, sortBy, sortOrder, showArchived]);

  // Status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: {
        label: 'Pendente',
        color: 'bg-slate-100 border-slate-300',
        headerColor: 'bg-slate-50',
        badgeColor: 'bg-slate-500 text-white',
        icon: Clock,
        iconColor: 'text-slate-600'
      },
      negociando: {
        label: 'Em Negociação',
        color: 'bg-yellow-100 border-yellow-300',
        headerColor: 'bg-yellow-50',
        badgeColor: 'bg-yellow-500 text-white',
        icon: AlertCircle,
        iconColor: 'text-yellow-600'
      },
      aprovada: {
        label: 'Aprovada',
        color: 'bg-green-100 border-green-300',
        headerColor: 'bg-green-50',
        badgeColor: 'bg-green-500 text-white',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      rejeitada: {
        label: 'Rejeitada',
        color: 'bg-red-100 border-red-300',
        headerColor: 'bg-red-50',
        badgeColor: 'bg-red-500 text-white',
        icon: XCircle,
        iconColor: 'text-red-600'
      }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: string) => {
    try {
      await updateProposal(proposalId, { status: newStatus });
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (confirm('Deseja realmente excluir esta proposta?')) {
      try {
        await deleteProposal(proposalId);
      } catch (error) {
        console.error('Error deleting proposal:', error);
      }
    }
  };
  
  const handleArchiveProposal = async (proposal: Proposal) => {
    try {
      await updateProposal(proposal.id, { is_archived: !proposal.is_archived });
    } catch (error) {
      console.error('Error archiving proposal:', error);
    }
  };

  const handleCreateProposal = () => {
    setSelectedProposal(null);
    setProposalModalMode('create');
    setShowProposalModal(true);
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setProposalModalMode('view');
    setShowProposalModal(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setProposalModalMode('edit');
    setShowProposalModal(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchProposals();
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Gestão de Propostas</h1>
          <p className="text-muted-foreground">Acesso restrito à administração</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-warning" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Este módulo está disponível apenas para administradores autorizados.
              Entre em contato com a administração para mais informações.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Propostas</h1>
          <p className="text-muted-foreground">
            Pipeline completo de vendas com analytics avançado
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>

          <Button onClick={handleCreateProposal}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{analytics.totalProposals}</p>
                      <p className="text-xs text-muted-foreground">Total de Propostas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">Valor Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{analytics.urgentFollowUps + analytics.overdueFollowUps}</p>
                      <p className="text-xs text-muted-foreground">Follow-ups Urgentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Distribuição por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.statusCounts).map(([status, count]) => {
                      const config = getStatusConfig(status);
                      const percentage = analytics.totalProposals > 0 ? (count / analytics.totalProposals) * 100 : 0;

                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <config.icon className={`h-4 w-4 ${config.iconColor}`} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Valores por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Aprovadas</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(analytics.approvedValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">Em Negociação</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {formatCurrency(analytics.negotiatingValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-800">Pendentes</span>
                      <span className="text-lg font-bold text-slate-600">
                        {formatCurrency(analytics.pendingValue)}
                      </span>
                    </div>
                    <div className="text-center pt-4 border-t">
                      <div className="text-sm text-muted-foreground">Valor Médio por Proposta</div>
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(analytics.avgValue)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Kanban Tab */}
        <TabsContent value="kanban" className="space-y-6">
          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar por cliente ou observações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="negociando">Em Negociação</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Kanban Board */}
          <div className="flex gap-6 overflow-x-auto pb-4">
            {['pendente', 'negociando', 'aprovada', 'rejeitada'].map((status, index) => {
              const statusConfig = getStatusConfig(status);
              const statusProposals = filteredAndSortedProposals.filter(p => p.status === status);

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-shrink-0 w-80"
                >
                  <div className={`rounded-lg border-2 ${statusConfig.color} min-h-[600px]`}>
                    <div className={`${statusConfig.headerColor} p-4 rounded-t-lg border-b`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <statusConfig.icon className={`h-5 w-5 ${statusConfig.iconColor}`} />
                          <h3 className="font-semibold text-gray-700">{statusConfig.label}</h3>
                        </div>
                        <Badge className={statusConfig.badgeColor}>
                          {statusProposals.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(statusProposals.reduce((sum, p) => sum + p.proposal_value, 0))}
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      <AnimatePresence>
                        {statusProposals.map((proposal) => (
                          <motion.div
                            key={proposal.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                  {proposal.client_name}
                                </h4>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                    onClick={() => handleViewProposal(proposal)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                    onClick={() => handleEditProposal(proposal)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-gray-100"
                                    onClick={() => handleArchiveProposal(proposal)}
                                    title={proposal.is_archived ? "Desarquivar" : "Arquivar"}
                                  >
                                    <Archive className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(proposal.proposal_value)}
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{formatDate(proposal.proposal_date)}</span>
                                </div>

                                {proposal.last_meeting && (
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span>Reunião: {formatDate(proposal.last_meeting)}</span>
                                  </div>
                                )}

                                {proposal.proposal_link && (
                                  <div className="flex items-center">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    <a
                                      href={proposal.proposal_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Ver proposta
                                    </a>
                                  </div>
                                )}
                              </div>

                              {proposal.notes && (
                                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-2">
                                  {proposal.notes}
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <Select
                                  value={proposal.status}
                                  onValueChange={(newStatus) => handleStatusChange(proposal.id, newStatus)}
                                >
                                  <SelectTrigger className="w-32 h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="negociando">Negociando</SelectItem>
                                    <SelectItem value="aprovada">Aprovada</SelectItem>
                                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                                  </SelectContent>
                                </Select>

                                {proposal.followup_date && (
                                  <Badge
                                    variant={proposal.overdue ? "destructive" : proposal.isUrgent ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {proposal.overdue ? "Atrasado" :
                                     proposal.isUrgent ? "Urgente" :
                                     formatDate(proposal.followup_date)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {statusProposals.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma proposta</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Table Tab */}
        <TabsContent value="table" className="space-y-6">
          {/* Filters and Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar propostas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="negociando">Em Negociação</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposal_date">Data da Proposta</SelectItem>
                      <SelectItem value="client_name">Cliente</SelectItem>
                      <SelectItem value="proposal_value">Valor</SelectItem>
                      <SelectItem value="followup_date">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Propostas</CardTitle>
                <CardDescription>
                  {filteredAndSortedProposals.length} proposta(s) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('client_name')}>
                          Cliente
                          {sortBy === 'client_name' && (
                            sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('proposal_value')}>
                          Valor
                          {sortBy === 'proposal_value' && (
                            sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('proposal_date')}>
                          Data
                          {sortBy === 'proposal_date' && (
                            sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedProposals.map((proposal) => (
                        <TableRow key={proposal.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div>
                              <div>{proposal.client_name}</div>
                              {proposal.last_meeting && (
                                <div className="text-xs text-muted-foreground">
                                  Última reunião: {formatDate(proposal.last_meeting)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(proposal.proposal_value)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={proposal.status}
                              onValueChange={(newStatus) => handleStatusChange(proposal.id, newStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="negociando">Negociando</SelectItem>
                                <SelectItem value="aprovada">Aprovada</SelectItem>
                                <SelectItem value="rejeitada">Rejeitada</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(proposal.proposal_date)}</TableCell>
                          <TableCell>
                            {proposal.followup_date ? (
                              <Badge
                                variant={proposal.overdue ? "destructive" : proposal.isUrgent ? "default" : "secondary"}
                              >
                                {proposal.overdue ? "Atrasado" :
                                 proposal.isUrgent ? "Urgente" :
                                 formatDate(proposal.followup_date)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {proposal.notes ? (
                              <div className="max-w-xs truncate text-sm">
                                {proposal.notes}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleViewProposal(proposal)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEditProposal(proposal)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleArchiveProposal(proposal)}
                                title={proposal.is_archived ? "Desarquivar" : "Arquivar"}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredAndSortedProposals.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold text-muted-foreground">Nenhuma proposta encontrada</h3>
                      <p className="text-muted-foreground">
                        Tente ajustar os filtros ou criar uma nova proposta.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Proposal Modal */}
      <ProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        proposal={selectedProposal}
        mode={proposalModalMode}
      />
    </div>
  );
};

export default Propostas;