import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'create' | 'edit';
}

const TEAM_MEMBERS = [
  { id: '2', name: 'Gustavo' },
  { id: '3', name: 'Bessa' },
  { id: '4', name: 'Leonardo' },
  { id: '5', name: 'Pedro' },
  { id: '6', name: 'Thiago' },
  { id: '7', name: 'Nicolas' },
  { id: '8', name: 'Eloisy' },
  { id: '9', name: 'Rondinelly' },
  { id: '10', name: 'Edilson' },
  { id: '11', name: 'Stael' },
  { id: '12', name: 'Philip' },
  { id: '13', name: 'Nara' },
  { id: '14', name: 'Projetista Externo' }
];

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project, mode }) => {
  const { updateProject, addProject } = useAppData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: 'privado' as 'privado' | 'publico',
    status: 'EM_ANDAMENTO' as Project['status'],
    phase: 'ESTUDO_PRELIMINAR' as Project['phase'],
    description: '',
    responsible_id: '',
    contract_start: format(new Date(), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
    activity_start: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 150), 'yyyy-MM-dd'),
    project_value: 0,
    amount_paid: 0,
    payment_date: ''
  });

  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        name: project.name,
        client: project.client,
        type: project.type,
        status: project.status,
        phase: project.phase,
        description: project.description || '',
        responsible_id: project.responsible_id,
        contract_start: project.contract_start,
        contract_end: project.contract_end,
        activity_start: project.activity_start,
        delivery_deadline: project.delivery_deadline,
        project_value: project.project_value,
        amount_paid: project.amount_paid,
        payment_date: project.payment_date || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        client: '',
        type: 'privado',
        status: 'EM_ANDAMENTO',
        phase: 'ESTUDO_PRELIMINAR',
        description: '',
        responsible_id: '',
        contract_start: format(new Date(), 'yyyy-MM-dd'),
        contract_end: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
        activity_start: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        delivery_deadline: format(addDays(new Date(), 150), 'yyyy-MM-dd'),
        project_value: 0,
        amount_paid: 0,
        payment_date: ''
      });
    }
  }, [project, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.client || !formData.responsible_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'edit' && project) {
      const updatedProject: Partial<Project> = {
        ...formData,
        last_delivery: formData.status === 'FINALIZADO' ? new Date().toISOString() : project.last_delivery,
        updated_at: new Date().toISOString()
      };

      updateProject(project.id, updatedProject);

      toast({
        title: "Sucesso",
        description: "Projeto atualizado com sucesso!",
      });
    } else {
      // Create new project
      const newProject = {
        ...formData,
        created_by: user?.id || '1'
      };

      addProject(newProject);

      toast({
        title: "Sucesso",
        description: "Novo projeto criado com sucesso!",
      });
    }

    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Automaticamente atualizar data de última entrega quando status for FINALIZADO
      if (field === 'status' && value === 'FINALIZADO') {
        newData.last_delivery = new Date().toISOString();
      }

      // Automaticamente definir data de início da atividade para hoje quando status for EM_ANDAMENTO
      if (field === 'status' && value === 'EM_ANDAMENTO' && !prev.activity_start) {
        newData.activity_start = format(new Date(), 'yyyy-MM-dd');
      }

      return newData;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Projeto' : 'Editar Projeto'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha as informações para criar um novo projeto.'
              : 'Atualize as informações do projeto.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Projeto */}
            <div>
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: PABLO - CASA ALTO PADRÃO"
                required
              />
            </div>

            {/* Cliente/Órgão */}
            <div>
              <Label htmlFor="client">Cliente/Órgão *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                placeholder="Ex: Pablo, FHEMIG, etc."
                required
              />
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privado">Privado</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                  <SelectItem value="PARALISADO">Paralisado</SelectItem>
                  <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fase */}
            <div>
              <Label htmlFor="phase">Fase</Label>
              <Select value={formData.phase} onValueChange={(value) => handleInputChange('phase', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDO_PRELIMINAR">Estudo Preliminar</SelectItem>
                  <SelectItem value="PROJETO_BASICO">Projeto Básico</SelectItem>
                  <SelectItem value="PROJETO_EXECUTIVO">Projeto Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <div>
              <Label htmlFor="responsible">Responsável *</Label>
              <Select value={formData.responsible_id} onValueChange={(value) => handleInputChange('responsible_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor do Projeto */}
            <div>
              <Label htmlFor="project_value">Valor do Projeto (R$)</Label>
              <Input
                id="project_value"
                type="number"
                value={formData.project_value}
                onChange={(e) => handleInputChange('project_value', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Valor Pago */}
            <div>
              <Label htmlFor="amount_paid">Valor Pago (R$)</Label>
              <Input
                id="amount_paid"
                type="number"
                value={formData.amount_paid}
                onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Data de Início do Contrato */}
            <div>
              <Label htmlFor="contract_start">Início do Contrato</Label>
              <Input
                id="contract_start"
                type="date"
                value={formData.contract_start}
                onChange={(e) => handleInputChange('contract_start', e.target.value)}
              />
            </div>

            {/* Data de Fim do Contrato */}
            <div>
              <Label htmlFor="contract_end">Fim do Contrato</Label>
              <Input
                id="contract_end"
                type="date"
                value={formData.contract_end}
                onChange={(e) => handleInputChange('contract_end', e.target.value)}
              />
            </div>

            {/* Data de Início da Atividade */}
            <div>
              <Label htmlFor="activity_start">Início da Atividade</Label>
              <Input
                id="activity_start"
                type="date"
                value={formData.activity_start}
                onChange={(e) => handleInputChange('activity_start', e.target.value)}
              />
            </div>

            {/* Prazo de Entrega */}
            <div>
              <Label htmlFor="delivery_deadline">Prazo de Entrega</Label>
              <Input
                id="delivery_deadline"
                type="date"
                value={formData.delivery_deadline}
                onChange={(e) => handleInputChange('delivery_deadline', e.target.value)}
              />
            </div>

            {/* Data de Última Entrega */}
            <div>
              <Label htmlFor="last_delivery">Data de Última Entrega</Label>
              <Input
                id="last_delivery"
                type="date"
                value={project?.last_delivery ? format(new Date(project.last_delivery), 'yyyy-MM-dd') : ''}
                disabled
                placeholder="Atualizada automaticamente quando finalizado"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Atualizada automaticamente quando o status for alterado para "Finalizado"
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Status do Projeto</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o que é necessário fazer no projeto..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Projeto' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};