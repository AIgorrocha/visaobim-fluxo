import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  User,
  FileText,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useDisciplines, useProjectPricing } from '@/hooks/useDesignerFinancials';
import { ProjectPricing, Project, Profile } from '@/types';

// Formatar valores em BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface PricingFormData {
  project_id: string;
  discipline_name: string;
  newDiscipline: string;
  total_value: number;
  designer_percentage: number;
  majoracao: number;
  designer_id: string;
  notes: string;
}

const PrecificacaoProjetos = () => {
  const { user, profile } = useAuth();
  const { projects, profiles } = useSupabaseData();
  const { disciplines, loading: disciplinesLoading, createDiscipline, updateDiscipline, deleteDiscipline, refetch: refetchDisciplines } = useDisciplines();
  const { pricing, loading: pricingLoading, createPricing, updatePricing, deletePricing, refetch } = useProjectPricing();
  const { toast } = useToast();

  // Estados
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ProjectPricing | null>(null);
  const [deletingPricingId, setDeletingPricingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    project_id: '',
    discipline_name: '',
    newDiscipline: '',
    total_value: 0,
    designer_percentage: 40,
    majoracao: 0,
    designer_id: '',
    notes: ''
  });

  // Estados para gerenciamento de disciplinas
  const [isDisciplinesModalOpen, setIsDisciplinesModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<{ id: string; name: string } | null>(null);
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [deletingDisciplineId, setDeletingDisciplineId] = useState<string | null>(null);
  const [isDeleteDisciplineDialogOpen, setIsDeleteDisciplineDialogOpen] = useState(false);

  // Verificar se usuario e admin
  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Acesso restrito a administradores</p>
      </div>
    );
  }

  // Filtrar e ordenar projetos (mais recentes primeiro)
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.client.toLowerCase().includes(term)
      );
    }

    // Ordenar do mais recente pro mais antigo (por data de criação)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Mais recente primeiro
    });
  }, [projects, searchTerm]);

  // Precificacoes do projeto selecionado
  const projectPricing = useMemo(() => {
    if (!selectedProjectId) return [];
    return pricing.filter(p => p.project_id === selectedProjectId);
  }, [pricing, selectedProjectId]);

  // Projeto selecionado
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Total do projeto
  const projectTotal = useMemo(() => {
    return projectPricing.reduce((sum, p) => sum + Number(p.total_value), 0);
  }, [projectPricing]);

  const designerTotal = useMemo(() => {
    return projectPricing.reduce((sum, p) => sum + Number(p.designer_value || 0), 0);
  }, [projectPricing]);

  // Abrir modal para nova precificacao
  const handleAddPricing = () => {
    if (!selectedProjectId) {
      toast({
        title: 'Selecione um projeto',
        description: 'E necessario selecionar um projeto antes de adicionar precificacao',
        variant: 'destructive'
      });
      return;
    }

    setEditingPricing(null);
    setFormData({
      project_id: selectedProjectId,
      discipline_name: '',
      newDiscipline: '',
      total_value: 0,
      designer_percentage: 40,
      majoracao: 0,
      designer_id: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditPricing = (item: ProjectPricing) => {
    setEditingPricing(item);
    setFormData({
      project_id: item.project_id,
      discipline_name: item.discipline_name,
      newDiscipline: '',
      total_value: item.total_value,
      designer_percentage: item.designer_percentage,
      majoracao: (item as any).majoracao || 0,
      designer_id: item.designer_id || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  // Confirmar delete
  const handleDeleteClick = (id: string) => {
    setDeletingPricingId(id);
    setIsDeleteDialogOpen(true);
  };

  // Executar delete
  const handleConfirmDelete = async () => {
    if (!deletingPricingId) return;

    try {
      await deletePricing(deletingPricingId);
      toast({
        title: 'Precificacao removida',
        description: 'A precificacao foi removida com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingPricingId(null);
    }
  };

  // Salvar precificacao
  const handleSavePricing = async () => {
    try {
      // Determinar nome da disciplina (nova ou existente)
      const disciplineName = formData.discipline_name === '__new__'
        ? formData.newDiscipline.trim()
        : formData.discipline_name;

      // Validar
      if (!disciplineName) {
        toast({
          title: 'Disciplina obrigatoria',
          description: 'Selecione ou digite uma disciplina',
          variant: 'destructive'
        });
        return;
      }

      if (formData.total_value <= 0) {
        toast({
          title: 'Valor invalido',
          description: 'O valor total deve ser maior que zero',
          variant: 'destructive'
        });
        return;
      }

      const dataToSave = {
        project_id: formData.project_id,
        discipline_name: disciplineName,
        total_value: formData.total_value,
        designer_percentage: formData.designer_percentage,
        majoracao: formData.majoracao || 0,
        designer_id: formData.designer_id || null,
        notes: formData.notes || null,
        amount_paid: 0,
        status: 'pendente' as const,
        created_by: user.id
      };

      if (editingPricing) {
        await updatePricing(editingPricing.id, dataToSave);
        toast({
          title: 'Precificacao atualizada',
          description: 'A precificacao foi atualizada com sucesso'
        });
      } else {
        await createPricing(dataToSave);
        toast({
          title: 'Precificacao criada',
          description: 'A precificacao foi criada com sucesso'
        });
      }

      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Calcular valor do projetista (porcentagem + majoração)
  const baseDesignerValue = (formData.total_value * formData.designer_percentage) / 100;
  const calculatedDesignerValue = baseDesignerValue + (formData.majoracao || 0);

  // Handlers para gerenciamento de disciplinas
  const handleAddDiscipline = async () => {
    const trimmedName = newDisciplineName.trim().toUpperCase();

    if (!trimmedName) {
      toast({
        title: 'Nome obrigatorio',
        description: 'Digite o nome da disciplina',
        variant: 'destructive'
      });
      return;
    }

    // Verificar se ja existe
    const exists = disciplines.some(d => d.name.toUpperCase() === trimmedName);
    if (exists) {
      toast({
        title: 'Disciplina ja existe',
        description: `A disciplina "${trimmedName}" ja esta cadastrada`,
        variant: 'destructive'
      });
      return;
    }

    try {
      await createDiscipline(trimmedName);
      setNewDisciplineName('');
      toast({
        title: 'Disciplina criada',
        description: 'A disciplina foi criada com sucesso'
      });
    } catch (error: any) {
      const message = error.message?.includes('duplicate')
        ? 'Esta disciplina ja existe no sistema'
        : error.message;
      toast({
        title: 'Erro ao criar',
        description: message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateDiscipline = async () => {
    if (!editingDiscipline || !editingDiscipline.name.trim()) return;

    const trimmedName = editingDiscipline.name.trim().toUpperCase();

    // Verificar se ja existe outra disciplina com esse nome
    const exists = disciplines.some(d =>
      d.id !== editingDiscipline.id && d.name.toUpperCase() === trimmedName
    );
    if (exists) {
      toast({
        title: 'Nome ja existe',
        description: `Ja existe outra disciplina chamada "${trimmedName}"`,
        variant: 'destructive'
      });
      return;
    }

    try {
      await updateDiscipline(editingDiscipline.id, { name: trimmedName });
      setEditingDiscipline(null);
      toast({
        title: 'Disciplina atualizada',
        description: 'A disciplina foi atualizada com sucesso'
      });
    } catch (error: any) {
      const message = error.message?.includes('duplicate')
        ? 'Este nome ja esta em uso'
        : error.message;
      toast({
        title: 'Erro ao atualizar',
        description: message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDiscipline = async () => {
    if (!deletingDisciplineId) return;

    try {
      await deleteDiscipline(deletingDisciplineId);
      setIsDeleteDisciplineDialogOpen(false);
      setDeletingDisciplineId(null);
      toast({
        title: 'Disciplina removida',
        description: 'A disciplina foi removida com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Precificacao de Projetos</h1>
          <p className="text-muted-foreground">
            Defina valores por disciplina e atribua projetistas responsaveis
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsDisciplinesModalOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Gerenciar Disciplinas
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Projetos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Projetos
              </CardTitle>
              <CardDescription>Selecione um projeto para precificar</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Busca */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projeto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Lista */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    <p className={`text-xs ${
                      selectedProjectId === project.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}>
                      {project.client}
                    </p>
                    <Badge
                      variant={project.type === 'publico' ? 'default' : 'secondary'}
                      className="mt-1 text-xs"
                    >
                      {project.type === 'publico' ? 'Publico' : 'Privado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Precificacao do Projeto */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {selectedProject
                      ? `Precificacao: ${selectedProject.name}`
                      : 'Selecione um projeto'
                    }
                  </CardTitle>
                  {selectedProject && (
                    <CardDescription>
                      Cliente: {selectedProject.client} | Tipo: {selectedProject.type}
                    </CardDescription>
                  )}
                </div>
                {selectedProject && (
                  <Button onClick={handleAddPricing}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Disciplina
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedProject ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um projeto na lista ao lado para ver ou adicionar precificacoes</p>
                </div>
              ) : pricingLoading ? (
                <p className="text-center py-4 text-muted-foreground">Carregando...</p>
              ) : projectPricing.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhuma precificacao cadastrada para este projeto</p>
                  <p className="text-sm mt-2">Clique em "Adicionar Disciplina" para comecar</p>
                </div>
              ) : (
                <>
                  {/* Totais */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total do Projeto</p>
                      <p className="text-2xl font-bold">{formatCurrency(projectTotal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projetistas (40%)</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(designerTotal)}</p>
                    </div>
                  </div>

                  {/* Tabela */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Projetista</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead className="text-right">Valor Projetista</TableHead>
                        <TableHead className="text-right">Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectPricing.map((item) => {
                        const designer = profiles.find(p => p.id === item.designer_id);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.discipline_name}</TableCell>
                            <TableCell>
                              {designer?.full_name || (
                                <span className="text-muted-foreground">Nao atribuido</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.total_value)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.designer_percentage}%
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(item.designer_value)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPricing(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Adicionar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPricing ? 'Editar Precificacao' : 'Nova Precificacao'}
            </DialogTitle>
            <DialogDescription>
              {editingPricing
                ? 'Altere os dados da precificacao'
                : 'Adicione uma nova disciplina ao projeto'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Disciplina */}
            <div className="space-y-2">
              <Label>Disciplina *</Label>
              <Select
                value={formData.discipline_name}
                onValueChange={(value) => setFormData({ ...formData, discipline_name: value, newDiscipline: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((disc) => (
                    <SelectItem key={disc.id} value={disc.name}>
                      {disc.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Nova disciplina</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo para nova disciplina */}
            {formData.discipline_name === '__new__' && (
              <div className="space-y-2">
                <Label>Nome da Nova Disciplina *</Label>
                <Input
                  value={formData.newDiscipline}
                  onChange={(e) => setFormData({ ...formData, newDiscipline: e.target.value })}
                  placeholder="Digite o nome da disciplina"
                />
              </div>
            )}

            {/* Valor Total */}
            <div className="space-y-2">
              <Label>Valor Total da Disciplina (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_value || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  total_value: parseFloat(e.target.value) || 0
                })}
                placeholder="0,00"
              />
            </div>

            {/* Porcentagem */}
            <div className="space-y-2">
              <Label>Porcentagem do Projetista (%)</Label>
              <Input
                type="number"
                step={1}
                min={0}
                max={100}
                value={formData.designer_percentage}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    designer_percentage: isNaN(val) ? 0 : Math.min(100, Math.max(0, val))
                  });
                }}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto"
              />
            </div>

            {/* Majoração (opcional) */}
            <div className="space-y-2">
              <Label>Majoracao (R$) - Opcional</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.majoracao || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  majoracao: parseFloat(e.target.value) || 0
                })}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Valor extra a adicionar ao calculo do projetista
              </p>
            </div>

            {/* Valor Calculado */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Valor do Projetista (calculado + majoracao)</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(calculatedDesignerValue)}
              </p>
              {formData.majoracao > 0 && (
                <p className="text-xs text-muted-foreground">
                  Base: {formatCurrency(baseDesignerValue)} + Majoracao: {formatCurrency(formData.majoracao)}
                </p>
              )}
            </div>

            {/* Projetista Responsavel */}
            <div className="space-y-2">
              <Label>Projetista Responsavel</Label>
              <Select
                value={formData.designer_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, designer_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projetista (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nao atribuido</SelectItem>
                  {profiles
                    .filter(p => p.id && (p.role === 'user' || p.role === 'admin'))
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Observacoes */}
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <Button onClick={handleSavePricing}>
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
              Tem certeza que deseja remover esta precificacao?
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

      {/* Modal de Gerenciamento de Disciplinas */}
      <Dialog open={isDisciplinesModalOpen} onOpenChange={setIsDisciplinesModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Disciplinas</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova disciplinas do sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Adicionar nova disciplina */}
            <div className="flex gap-2">
              <Input
                value={newDisciplineName}
                onChange={(e) => setNewDisciplineName(e.target.value)}
                placeholder="Nova disciplina..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddDiscipline()}
              />
              <Button onClick={handleAddDiscipline}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de disciplinas */}
            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {disciplines.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhuma disciplina cadastrada
                </p>
              ) : (
                disciplines.map((disc) => (
                  <div key={disc.id} className="flex items-center justify-between p-3">
                    {editingDiscipline?.id === disc.id ? (
                      <div className="flex gap-2 flex-1">
                        <Input
                          value={editingDiscipline.name}
                          onChange={(e) => setEditingDiscipline({ ...editingDiscipline, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateDiscipline()}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleUpdateDiscipline}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingDiscipline(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{disc.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingDiscipline({ id: disc.id, name: disc.name })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeletingDisciplineId(disc.id);
                              setIsDeleteDisciplineDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisciplinesModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmacao de Delete Disciplina */}
      <AlertDialog open={isDeleteDisciplineDialogOpen} onOpenChange={setIsDeleteDisciplineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta disciplina?
              Ela nao aparecera mais nas opcoes de selecao.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingDisciplineId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDiscipline} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrecificacaoProjetos;
