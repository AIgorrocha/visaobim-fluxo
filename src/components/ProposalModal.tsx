import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: string;
}

const ProposalModal = ({ isOpen, onClose, initialStatus = 'pendente' }: ProposalModalProps) => {
  const { createProposal } = useSupabaseData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    client_name: '',
    proposal_value: '',
    proposal_date: new Date().toISOString().split('T')[0],
    last_meeting: '',
    notes: '',
    followup_date: '',
    proposal_link: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProposal({
        client_name: formData.client_name,
        proposal_value: parseFloat(formData.proposal_value) || 0,
        proposal_date: formData.proposal_date,
        last_meeting: formData.last_meeting || null,
        notes: formData.notes || null,
        followup_date: formData.followup_date || null,
        proposal_link: formData.proposal_link || null,
        status: initialStatus,
        created_by: user?.id
      });

      toast({
        title: "Proposta criada",
        description: "Nova proposta adicionada com sucesso.",
      });

      onClose();
      setFormData({
        client_name: '',
        proposal_value: '',
        proposal_date: new Date().toISOString().split('T')[0],
        last_meeting: '',
        notes: '',
        followup_date: '',
        proposal_link: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar proposta",
        description: error.message || "Não foi possível criar a proposta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
          <DialogDescription>
            Preencha as informações da proposta para adicioná-la ao pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Cliente *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Nome ou empresa do cliente"
                required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_date">Data da Proposta</Label>
              <Input
                id="proposal_date"
                type="date"
                value={formData.proposal_date}
                onChange={(e) => setFormData(prev => ({ ...prev, proposal_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_meeting">Data da Última Reunião</Label>
              <Input
                id="last_meeting"
                type="date"
                value={formData.last_meeting}
                onChange={(e) => setFormData(prev => ({ ...prev, last_meeting: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup_date">Data de Follow-up</Label>
              <Input
                id="followup_date"
                type="date"
                value={formData.followup_date}
                onChange={(e) => setFormData(prev => ({ ...prev, followup_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_link">Link da Proposta</Label>
              <Input
                id="proposal_link"
                type="url"
                value={formData.proposal_link}
                onChange={(e) => setFormData(prev => ({ ...prev, proposal_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Descrição/Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Detalhes sobre a proposta, cliente, projeto..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Proposta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalModal;