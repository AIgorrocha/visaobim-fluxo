import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'create' | 'edit' | 'view';
}

const ProjectModal = ({ isOpen, onClose, project, mode }: ProjectModalProps) => {
  const { createProject, updateProject } = useAppData();
  const { user } = useAuth();

  // Lista de responsáveis (sem Admin)
  const teamMembers = [
    { id: '1', name: 'Igor' },
    { id: '2', name: 'Gustavo' },
    { id: '3', name: 'Bessa' },
    { id: '4', name: 'Leonardo' },
    { id: '5', name: 'Pedro' },
    { id: '6', name: 'Thiago' },
    { id: '7', name: 'Nicolas' },
    { id: '8', name: 'Eloisy' },
    { id: '9', name: 'Rondinelly' },
    { id: '10', name: 'Edilson' },
    { id: '11', name: 'Philip' },
    { id: '12', name: 'Nara' },
    { id: '13', name: 'Stael' },
    { id: '14', name: 'Projetista Externo' }
  ];

  // Função para converter data do formato ISO para input date (corrige bug do timezone)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Função para converter data do input para formato ISO (mantém a data correta)
  const formatDateForStorage = (dateString: string) => {
    if (!dateString) return '';
    return dateString; // Mantém o formato YYYY-MM-DD
  };

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: 'privado' as 'privado' | 'publico',
    status: 'EM_ANDAMENTO' as Project['status'],
    description: '',
    responsible_ids: [] as string[],
    contract_start: '',
    contract_end: '',
    prazo_vigencia: '',
    created_by: user?.id || ''
  });

  useEffect(() => {
    if (project && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: project.name,
        client: project.client,
        type: project.type,
        status: project.status,
        description: project.description,
        responsible_ids: project.responsible_ids || [],
        contract_start: formatDateForInput(project.contract_start),
        contract_end: formatDateForInput(project.contract_end),
        prazo_vigencia: formatDateForInput(project.prazo_vigencia || ''),
        created_by: project.created_by
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        client: '',
        type: 'privado',
        status: 'EM_ANDAMENTO',
        description: '',
        responsible_ids: [],
        contract_start: '',
        contract_end: '',
        prazo_vigencia: '',
        created_by: user?.id || ''
      });
    }
  }, [project, mode, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Preparar dados com datas corretas
    const projectData = {
      ...formData,
      contract_start: formatDateForStorage(formData.contract_start),
      contract_end: formatDateForStorage(formData.contract_end),
      prazo_vigencia: formData.prazo_vigencia ? formatDateForStorage(formData.prazo_vigencia) : undefined
    };

    if (mode === 'create') {
      createProject(projectData);
    } else if (mode === 'edit' && project) {
      updateProject(project.id, projectData);
    }

    onClose();
  };

  const isReadOnly = mode === 'view';
  const isAdmin = user?.role === 'admin';

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Projeto';
      case 'edit': return 'Editar Projeto';
      case 'view': return 'Visualizar Projeto';
      default: return 'Projeto';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Preencha as informações para criar um novo projeto.'}
            {mode === 'edit' && 'Edite as informações do projeto.'}
            {mode === 'view' && 'Visualize as informações do projeto.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Casa Alto Padrão"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Nome do cliente"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'privado' | 'publico') =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
                disabled={isReadOnly}
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Project['status']) =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
                disabled={isReadOnly}
              >
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

            <div className="space-y-2">
              <Label htmlFor="prazo_vigencia">Prazo de Vigência</Label>
              <Input
                id="prazo_vigencia"
                type="date"
                value={formData.prazo_vigencia}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo_vigencia: e.target.value }))}
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2 col-span-full">
              <Label>Responsáveis</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`responsible-${member.id}`}
                      checked={formData.responsible_ids.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            responsible_ids: [...prev.responsible_ids, member.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            responsible_ids: prev.responsible_ids.filter(id => id !== member.id)
                          }));
                        }
                      }}
                      disabled={isReadOnly}
                    />
                    <Label
                      htmlFor={`responsible-${member.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_start">Data Início do Contrato</Label>
              <Input
                id="contract_start"
                type="date"
                value={formData.contract_start}
                onChange={(e) => setFormData(prev => ({ ...prev, contract_start: e.target.value }))}
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_end">Data Final do Contrato</Label>
              <Input
                id="contract_end"
                type="date"
                value={formData.contract_end}
                onChange={(e) => setFormData(prev => ({ ...prev, contract_end: e.target.value }))}
                readOnly={isReadOnly}
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o projeto..."
              rows={3}
              readOnly={isReadOnly}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && (
              <Button type="submit">
                {mode === 'create' ? 'Criar Projeto' : 'Salvar Alterações'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;