import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Proposal } from '@/types';
import { ExternalLink, Calendar, DollarSign, User, Clock } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal?: Proposal | null;
  mode: 'create' | 'edit' | 'view';
}

const ProposalModal = ({ isOpen, onClose, proposal, mode }: ProposalModalProps) => {
  const { createProposal, updateProposal } = useSupabaseData();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const isReadOnly = mode === 'view';
  const isAdmin = profile?.role === 'admin';

  const [formData, setFormData] = useState({
    client_name: '',
    proposal_value: '',
    proposal_date: new Date().toISOString().split('T')[0],
    last_meeting: '',
    notes: '',
    followup_date: '',
    proposal_link: '',
    status: 'pendente'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proposal && (mode === 'edit' || mode === 'view')) {
      setFormData({
        client_name: proposal.client_name || '',
        proposal_value: proposal.proposal_value.toString() || '',
        proposal_date: proposal.proposal_date || new Date().toISOString().split('T')[0],
        last_meeting: proposal.last_meeting || '',
        notes: proposal.notes || '',
        followup_date: proposal.followup_date || '',
        proposal_link: proposal.proposal_link || '',
        status: proposal.status || 'pendente'
      });
    } else if (mode === 'create') {
      setFormData({
        client_name: '',
        proposal_value: '',
        proposal_date: new Date().toISOString().split('T')[0],
        last_meeting: '',
        notes: '',
        followup_date: '',
        proposal_link: '',
        status: 'pendente'
      });
    }
  }, [proposal, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const proposalData = {
        client_name: formData.client_name,
        proposal_value: parseFloat(formData.proposal_value) || 0,
        proposal_date: formData.proposal_date,
        last_meeting: formData.last_meeting || null,
        notes: formData.notes || null,
        followup_date: formData.followup_date || null,
        proposal_link: formData.proposal_link || null,
        status: formData.status
      };

      if (mode === 'create') {
        await createProposal({
          ...proposalData,
          created_by: user?.id
        });

        toast({
          title: "Proposta criada",
          description: "Nova proposta adicionada com sucesso.",
        });
      } else if (mode === 'edit' && proposal) {
        await updateProposal(proposal.id, proposalData);

        toast({
          title: "Proposta atualizada",
          description: "Proposta editada com sucesso.",
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        title: mode === 'create' ? "Erro ao criar proposta" : "Erro ao atualizar proposta",
        description: error.message || "Não foi possível salvar a proposta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Proposta';
      case 'edit': return 'Editar Proposta';
      case 'view': return 'Visualizar Proposta';
      default: return 'Proposta';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'create': return 'Preencha as informações para criar uma nova proposta.';
      case 'edit': return 'Edite as informações da proposta.';
      case 'view': return 'Informações detalhadas da proposta.';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', className: 'bg-slate-500 text-white' },
      negociando: { label: 'Em Negociação', className: 'bg-yellow-500 text-white' },
      aprovada: { label: 'Aprovada', className: 'bg-green-500 text-white' },
      rejeitada: { label: 'Rejeitada', className: 'bg-red-500 text-white' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateDaysUntilFollowup = () => {
    if (!formData.followup_date) return null;
    const now = new Date();
    const followupDate = new Date(formData.followup_date);
    const timeDiff = followupDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const daysUntilFollowup = calculateDaysUntilFollowup();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* View Mode Header Info */}
          {mode === 'view' && proposal && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Status</Label>
                <div>{getStatusBadge(formData.status)}</div>
              </div>
              <div className="space-y-2">
                <Label>Valor da Proposta</Label>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(parseFloat(formData.proposal_value) || 0)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Criada em</Label>
                <div className="text-sm text-muted-foreground">
                  {proposal.created_at ? formatDate(proposal.created_at) : 'Não informado'}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Cliente *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Nome ou empresa do cliente"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_value">Valor da Proposta *</Label>
              <Input
                id="proposal_value"
                type="number"
                step="0.01"
                value={formData.proposal_value}
                onChange={(e) => setFormData(prev => ({ ...prev, proposal_value: e.target.value }))}
                placeholder="0.00"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_date">Data da Proposta</Label>
              <Input
                id="proposal_date"
                type="date"
                value={formData.proposal_date}
                onChange={(e) => setFormData(prev => ({ ...prev, proposal_date: e.target.value }))}
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status da Proposta</Label>
              {isReadOnly ? (
                <div className="py-2">
                  {getStatusBadge(formData.status)}
                </div>
              ) : (
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="negociando">Em Negociação</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_meeting">Data da Última Reunião</Label>
              <Input
                id="last_meeting"
                type="date"
                value={formData.last_meeting}
                onChange={(e) => setFormData(prev => ({ ...prev, last_meeting: e.target.value }))}
                readOnly={isReadOnly}
              />
              {mode === 'view' && formData.last_meeting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Reunião realizada em {formatDate(formData.last_meeting)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup_date">Data de Follow-up</Label>
              <Input
                id="followup_date"
                type="date"
                value={formData.followup_date}
                onChange={(e) => setFormData(prev => ({ ...prev, followup_date: e.target.value }))}
                readOnly={isReadOnly}
              />
              {mode === 'view' && formData.followup_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={
                    daysUntilFollowup !== null && daysUntilFollowup < 0 ? 'text-red-600' :
                    daysUntilFollowup !== null && daysUntilFollowup <= 3 ? 'text-orange-600' :
                    'text-muted-foreground'
                  }>
                    {daysUntilFollowup !== null && daysUntilFollowup < 0
                      ? `Atrasado ${Math.abs(daysUntilFollowup)} dia(s)`
                      : daysUntilFollowup !== null && daysUntilFollowup <= 3
                      ? `Urgente - ${daysUntilFollowup} dia(s) restante(s)`
                      : `Follow-up em ${formatDate(formData.followup_date)}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal_link">Link da Proposta</Label>
            <Input
              id="proposal_link"
              type="url"
              value={formData.proposal_link}
              onChange={(e) => setFormData(prev => ({ ...prev, proposal_link: e.target.value }))}
              placeholder="https://..."
              readOnly={isReadOnly}
            />
            {mode === 'view' && formData.proposal_link && (
              <div className="mt-2">
                <a
                  href={formData.proposal_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir proposta no navegador
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Descrição/Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Detalhes sobre a proposta, cliente, projeto..."
              rows={isReadOnly ? 4 : 3}
              readOnly={isReadOnly}
            />
          </div>

          {/* Additional Info for View Mode */}
          {mode === 'view' && proposal && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Atualizada em</Label>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {proposal.updated_at ? formatDate(proposal.updated_at) : 'Nunca atualizada'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ID da Proposta</Label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {proposal.id}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && isAdmin && (
              <Button type="submit" disabled={loading}>
                {loading
                  ? (mode === 'create' ? 'Criando...' : 'Salvando...')
                  : (mode === 'create' ? 'Criar Proposta' : 'Salvar Alterações')
                }
              </Button>
            )}
            {!isAdmin && mode !== 'view' && (
              <div className="text-xs text-muted-foreground">
                Apenas administradores podem criar/editar propostas
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalModal;