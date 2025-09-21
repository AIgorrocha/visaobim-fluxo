import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { ProjectModal } from '@/components/ProjectModal';
import { Project } from '@/types';

const Projetos = () => {
  const { user } = useAuth();
  const { projects, getProjectsByUser, deleteProject } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set());

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const allProjects = isAdmin ? projects : getProjectsByUser(user.id);

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      'EM_ANDAMENTO': { label: 'Em Andamento', className: 'bg-primary text-primary-foreground' },
      'FINALIZADO': { label: 'Finalizado', className: 'bg-success text-success-foreground' },
      'EM_ESPERA': { label: 'Em Espera', className: 'bg-warning text-warning-foreground' },
      'PARALISADO': { label: 'Paralisado', className: 'bg-destructive text-destructive-foreground' },
      'AGUARDANDO_PAGAMENTO': { label: 'Aguardando Pagamento', className: 'bg-secondary text-secondary-foreground' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPhaseBadge = (phase: Project['phase']) => {
    const phaseConfig = {
      'ESTUDO_PRELIMINAR': 'Estudo Preliminar',
      'PROJETO_BASICO': 'Projeto Básico',
      'PROJETO_EXECUTIVO': 'Projeto Executivo'
    };
    
    return <Badge variant="outline">{phaseConfig[phase]}</Badge>;
  };

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || project.status === statusFilter;
    const matchesType = typeFilter === 'todos' || project.type === typeFilter;
    const isNotHidden = !hiddenProjects.has(project.id);

    return matchesSearch && matchesStatus && matchesType && isNotHidden;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getResponsibleName = (responsibleId: string) => {
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
      { id: '11', name: 'Stael' },
      { id: '12', name: 'Philip' },
      { id: '13', name: 'Nara' },
      { id: '14', name: 'Projetista Externo' }
    ];

    const member = teamMembers.find(m => m.id === responsibleId);
    return member?.name || 'Não definido';
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleToggleVisibility = (projectId: string) => {
    setHiddenProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(projectId);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gerencie todos os projetos da empresa' : 'Seus projetos atribuídos'}
          </p>
        </div>
        
        {isAdmin && (
          <Button className="w-full sm:w-auto" onClick={handleNewProject}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar projetos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                  <SelectItem value="PARALISADO">Paralisado</SelectItem>
                  <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Lista de Projetos</CardTitle>
            <CardDescription>
              {filteredProjects.length} projeto(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fase</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Contrato</TableHead>
                    {isAdmin && <TableHead>Valor</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>
                        <Badge variant={project.type === 'privado' ? 'default' : 'secondary'}>
                          {project.type === 'privado' ? 'Privado' : 'Público'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>{getPhaseBadge(project.phase)}</TableCell>
                      <TableCell>
                        {getResponsibleName(project.responsible_id)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(project.contract_start)} até</div>
                          <div>{formatDate(project.contract_end)}</div>
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>{formatCurrency(project.project_value)}</TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleVisibility(project.id)}
                            title="Ocultar/Mostrar projeto"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditProject(project)}
                                title="Editar projeto"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                title="Excluir projeto"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredProjects.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum projeto encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
        mode={modalMode}
      />
    </div>
  );
};

export default Projetos;