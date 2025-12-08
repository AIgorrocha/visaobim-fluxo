import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Project } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'create' | 'edit' | 'view';
}

const ProjectModal = ({ isOpen, onClose, project, mode }: ProjectModalProps) => {
  const { createProject, updateProject, profiles } = useSupabaseData();
  const { user, profile } = useAuth();

  const isAdmin = profile?.role === 'admin';
  const isReadOnly = mode === 'view' || (!isAdmin && mode !== 'create');

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
    art_emitida: false,
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
        art_emitida: project.art_emitida || false,
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
        art_emitida: false,
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
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                  <SelectItem value="PARALISADO">Paralisado</SelectItem>
                  <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                  <SelectItem value="AGUARDANDO_APROVACAO">Aguardando Aprovação</SelectItem>
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

            <div className="space-y-2">
              <Label>ART Emitida</Label>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="art_emitida"
                  checked={formData.art_emitida}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, art_emitida: !!checked }))}
                  disabled={isReadOnly}
                />
                <Label htmlFor="art_emitida" className="text-sm font-normal cursor-pointer">
                  ART já foi emitida para este projeto
                </Label>
              </div>
            </div>

            <div className="space-y-2 col-span-full">
              <Label>Responsáveis</Label>
              {mode === 'view' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {project?.responsible_ids && project.responsible_ids.length > 0 ? (
                      project.responsible_ids.map((responsibleId) => {
                        const profileData = profiles.find(p => p.id === responsibleId);
                        return (
                          <Badge key={responsibleId} variant="secondary" className="px-3 py-1">
                            {profileData?.full_name || profileData?.email || `Usuário ${responsibleId}`}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhum responsável atribuído</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg">
                  {profiles.map((profileData) => (
                    <div key={profileData.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`responsible-${profileData.id}`}
                        checked={formData.responsible_ids && (formData.responsible_ids.includes(profileData.id) || formData.responsible_ids.includes(String(profileData.id)))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              responsible_ids: [...prev.responsible_ids, profileData.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              responsible_ids: prev.responsible_ids.filter(id => id !== profileData.id)
                            }));
                          }
                        }}
                        disabled={isReadOnly}
                      />
                      <Label
                        htmlFor={`responsible-${profileData.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {profileData.full_name || profileData.email}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
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

          {/* Informações Adicionais - Visível para todos em modo visualização */}
          {mode === 'view' && project && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Criado em</Label>
                  <div className="text-sm text-muted-foreground">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Criado por</Label>
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const creator = profiles.find(p => p.id === project.created_by);
                      return creator?.full_name || creator?.email || 'Usuário não encontrado';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && isAdmin && (
              <Button type="submit">
                {mode === 'create' ? 'Criar Projeto' : 'Salvar Alterações'}
              </Button>
            )}
            {!isAdmin && mode !== 'view' && (
              <div className="text-xs text-muted-foreground">
                Apenas administradores podem editar projetos
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;