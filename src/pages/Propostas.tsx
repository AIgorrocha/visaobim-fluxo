import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, DollarSign, Lock, Edit, User, Archive, Filter, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useState } from 'react';

const Propostas = () => {
  const { user, profile } = useAuth();
  const { proposals, updateProposal, deleteProposal } = useSupabaseData();

  if (!user) return null;

  // Verificar se é admin (apenas Igor e Stael)
  const isAdmin = user.role === 'admin' && (user.id === '1' || user.id === '13');

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
              Entre em contato com Igor ou Stael para mais informações.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingProposal, setEditingProposal] = useState(null);
  const [editForm, setEditForm] = useState({
    client_name: '',
    proposal_value: '',
    proposal_date: '',
    last_meeting: '',
    notes: '',
    followup_date: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      'pendente': {
        label: 'Novas',
        color: 'bg-slate-100 border-slate-200',
        headerColor: 'bg-slate-50',
        badgeColor: 'bg-slate-500 text-white'
      },
      'negociando': {
        label: 'Em Negociação',
        color: 'bg-yellow-100 border-yellow-200',
        headerColor: 'bg-yellow-50',
        badgeColor: 'bg-yellow-500 text-white'
      },
      'aprovada': {
        label: 'Aprovadas',
        color: 'bg-green-100 border-green-200',
        headerColor: 'bg-green-50',
        badgeColor: 'bg-green-500 text-white'
      },
      'rejeitada': {
        label: 'Rejeitadas',
        color: 'bg-red-100 border-red-200',
        headerColor: 'bg-red-50',
        badgeColor: 'bg-red-500 text-white'
      }
    };

    return statusConfig[status as keyof typeof statusConfig];
  };

  const updateProposalStatus = async (proposalId: string, newStatus: string) => {
    try {
      await updateProposal(proposalId, { status: newStatus });
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
  };

  const archiveProposal = async (proposalId: string) => {
    try {
      await deleteProposal(proposalId);
    } catch (error) {
      console.error('Error archiving proposal:', error);
    }
  };

  const addNewProposal = async (columnStatus: string) => {
    // This would be implemented with proper form handling
    console.log('Add new proposal with status:', columnStatus);
  };

  const editProposal = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setEditingProposal(proposal.id);
      setEditForm({
        client_name: proposal.client_name,
        proposal_value: proposal.proposal_value.toString(),
        proposal_date: proposal.proposal_date,
        last_meeting: proposal.last_meeting || '',
        notes: proposal.notes || '',
        followup_date: proposal.followup_date || ''
      });
    }
  };

  const saveProposal = async () => {
    if (editingProposal) {
      try {
        await updateProposal(editingProposal, {
          client_name: editForm.client_name,
          proposal_value: parseFloat(editForm.proposal_value) || 0,
          notes: editForm.notes,
          last_meeting: editForm.last_meeting || null,
          followup_date: editForm.followup_date || null
        });
        setEditingProposal(null);
      } catch (error) {
        console.error('Error saving proposal:', error);
      }
    }
  };
                proposal_date: editForm.proposal_date,
                last_meeting: editForm.last_meeting || null,
                notes: editForm.notes,
                followup_date: editForm.followup_date || null,
                updated_at: new Date().toISOString()
              }
            : p
        )
      );
      setEditingProposal(null);
      setEditForm({
        client_name: '',
        proposal_value: '',
        proposal_date: '',
        last_meeting: '',
        notes: '',
        followup_date: ''
      });
    }
  };

  const cancelEdit = () => {
    setEditingProposal(null);
    setEditForm({
      client_name: '',
      proposal_value: '',
      proposal_date: '',
      last_meeting: '',
      notes: '',
      followup_date: ''
    });
  };

  const columns = [
    { key: 'pendente', label: 'Novas', color: 'slate' },
    { key: 'negociando', label: 'Em Negociação', color: 'yellow' },
    { key: 'aprovada', label: 'Aprovadas', color: 'green' },
    { key: 'rejeitada', label: 'Rejeitadas', color: 'red' }
  ];

  // Filtrar propostas baseado no filtro selecionado
  const filteredProposals = filterStatus === 'all'
    ? proposals
    : proposals.filter(p => p.status === filterStatus);

  const ProposalCard = ({ proposal }: { proposal: any }) => (
    <motion.div
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
              onClick={(e) => {
                e.stopPropagation();
                editProposal(proposal.id);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Deseja arquivar esta proposta?')) {
                  archiveProposal(proposal.id);
                }
              }}
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
            <span>{new Date(proposal.proposal_date).toLocaleDateString('pt-BR')}</span>
          </div>

          {proposal.last_meeting && (
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>Reunião: {new Date(proposal.last_meeting).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {proposal.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            {proposal.notes}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <select
            value={proposal.status}
            onChange={(e) => updateProposalStatus(proposal.id, e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="pendente">Pendente</option>
            <option value="negociando">Negociando</option>
            <option value="aprovada">Aprovada</option>
            <option value="rejeitada">Rejeitada</option>
          </select>

          {proposal.followup_date && (
            <span className="text-xs text-orange-600 font-medium">
              Follow-up: {new Date(proposal.followup_date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline de Propostas</h1>
          <p className="text-muted-foreground">Sistema Kanban estilo Trello para gestão de vendas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pendente">Novas</SelectItem>
                <SelectItem value="negociando">Em Negociação</SelectItem>
                <SelectItem value="aprovada">Aprovadas</SelectItem>
                <SelectItem value="rejeitada">Rejeitadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => addNewProposal('pendente')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>
      </motion.div>

      {/* Kanban Board estilo Trello */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.filter(column => filterStatus === 'all' || column.key === filterStatus).map((column, index) => {
          const columnProposals = proposals.filter(p => p.status === column.key);
          const statusInfo = getStatusInfo(column.key);

          return (
            <motion.div
              key={column.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-80"
            >
              <div className={`rounded-lg border-2 ${statusInfo.color} min-h-[600px]`}>
                {/* Header da coluna */}
                <div className={`${statusInfo.headerColor} p-4 rounded-t-lg border-b`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">
                      {column.label}
                    </h3>
                    <Badge className={statusInfo.badgeColor}>
                      {columnProposals.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => addNewProposal(column.key)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Proposta
                  </Button>
                </div>

                {/* Cards da coluna */}
                <div className="p-3 space-y-3">
                  {columnProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}

                  {columnProposals.length === 0 && (
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

      {/* Modal de Edição */}
      {editingProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Proposta</h3>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="client_name">Nome do Cliente</Label>
                <Input
                  id="client_name"
                  value={editForm.client_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <Label htmlFor="proposal_value">Valor da Proposta</Label>
                <Input
                  id="proposal_value"
                  type="number"
                  value={editForm.proposal_value}
                  onChange={(e) => setEditForm(prev => ({ ...prev, proposal_value: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="proposal_date">Enviada em</Label>
                <Input
                  id="proposal_date"
                  type="date"
                  value={editForm.proposal_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, proposal_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="last_meeting">Última Reunião Realizada</Label>
                <Input
                  id="last_meeting"
                  type="date"
                  value={editForm.last_meeting}
                  onChange={(e) => setEditForm(prev => ({ ...prev, last_meeting: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Descrição da Proposta</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Descrição detalhada da proposta..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="followup_date">Follow-up</Label>
                <Input
                  id="followup_date"
                  type="date"
                  value={editForm.followup_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, followup_date: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveProposal} className="flex-1">
                  Salvar
                </Button>
                <Button variant="outline" onClick={cancelEdit} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Propostas;