import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, DollarSign, Lock, Edit, ExternalLink, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { mockProposals } from '@/data/mockData';
import { useState } from 'react';

const Propostas = () => {
  const { user } = useAuth();

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
  const [proposals, setProposals] = useState(mockProposals);

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

  const updateProposalStatus = (proposalId: string, newStatus: string) => {
    setProposals(prev =>
      prev.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, status: newStatus as 'pendente' | 'aprovada' | 'rejeitada' | 'negociando' }
          : proposal
      )
    );
  };

  const columns = [
    { key: 'pendente', label: 'Novas', color: 'slate' },
    { key: 'negociando', label: 'Em Negociação', color: 'yellow' },
    { key: 'aprovada', label: 'Aprovadas', color: 'green' },
    { key: 'rejeitada', label: 'Rejeitadas', color: 'red' }
  ];

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
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            onClick={() => alert('Editar proposta (funcionalidade em desenvolvimento)')}
          >
            <Edit className="h-3 w-3" />
          </Button>
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

          {proposal.proposal_link && (
            <div className="flex items-center">
              <ExternalLink className="h-3 w-3 mr-1" />
              <a
                href={proposal.proposal_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Ver proposta
              </a>
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
        <Button onClick={() => alert('Nova proposta (funcionalidade em desenvolvimento)')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Proposta
        </Button>
      </motion.div>

      {/* Kanban Board estilo Trello */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column, index) => {
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">
                      {column.label}
                    </h3>
                    <Badge className={statusInfo.badgeColor}>
                      {columnProposals.length}
                    </Badge>
                  </div>
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
    </div>
  );
};

export default Propostas;