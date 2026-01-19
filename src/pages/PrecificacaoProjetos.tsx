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
  FileText
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
  total_value: number;
  designer_percentage: number;
  designer_id: string;
  notes: string;
}

const PrecificacaoProjetos = () => {
  const { user, profile } = useAuth();
  const { projects, profiles } = useSupabaseData();
  const { disciplines, loading: disciplinesLoading } = useDisciplines();
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
    total_value: 0,
    designer_percentage: 40,
    designer_id: '',
    notes: ''
  });

  // Verificar se usuario e admin
  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Acesso restrito a administradores</p>
      </div>
    );
  }

  // Filtrar projetos pela busca
  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    const term = searchTerm.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.client.toLowerCase().includes(term)
    );
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
      total_value: 0,
      designer_percentage: 40,
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
      total_value: item.total_value,
      designer_percentage: item.designer_percentage,
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
      // Validar
      if (!formData.discipline_name) {
        toast({
          title: 'Disciplina obrigatoria',
          description: 'Selecione uma disciplina',
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
        discipline_name: formData.discipline_name,
        total_value: formData.total_value,
        designer_percentage: formData.designer_percentage,
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

  // Calcular valor do projetista
  const calculatedDesignerValue = (formData.total_value * formData.designer_percentage) / 100;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Precificacao de Projetos</h1>
        <p className="text-muted-foreground">
          Defina valores por disciplina e atribua projetistas responsaveis
        </p>
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
                        <TableHead>Status</TableHead>
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
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === 'pago' ? 'default' :
                                  item.status === 'parcial' ? 'secondary' : 'outline'
                                }
                                className={item.status === 'pago' ? 'bg-green-500' : ''}
                              >
                                {item.status === 'pago' ? 'Pago' :
                                 item.status === 'parcial' ? 'Parcial' : 'Pendente'}
                              </Badge>
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
                onValueChange={(value) => setFormData({ ...formData, discipline_name: value })}
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
                </SelectContent>
              </Select>
            </div>

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
                step="1"
                min="0"
                max="100"
                value={formData.designer_percentage}
                onChange={(e) => setFormData({
                  ...formData,
                  designer_percentage: parseFloat(e.target.value) || 40
                })}
              />
            </div>

            {/* Valor Calculado */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Valor do Projetista (calculado)</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(calculatedDesignerValue)}
              </p>
            </div>

            {/* Projetista Responsavel */}
            <div className="space-y-2">
              <Label>Projetista Responsavel</Label>
              <Select
                value={formData.designer_id}
                onValueChange={(value) => setFormData({ ...formData, designer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projetista (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nao atribuido</SelectItem>
                  {profiles
                    .filter(p => p.role === 'user' || p.role === 'admin')
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
    </div>
  );
};

export default PrecificacaoProjetos;
