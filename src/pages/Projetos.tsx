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
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import ProjectModal from '@/components/ProjectModal';
import { Project } from '@/types';

const Projetos = () => {
  const { user } = useAuth();
  const { projects, deleteProject } = useSupabaseData();

  // Função para obter projetos do usuário
  const getProjectsByUser = (userId: string) => {
    return projects.filter(project => 
      project.responsible_ids && project.responsible_ids.includes(userId)
    );
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos');
  const [vigenciaFilter, setVigenciaFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const allProjects = isAdmin ? projects : getProjectsByUser(user.id);

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      'EM_ANDAMENTO': { label: 'Em Andamento', className: 'bg-primary text-primary-foreground' },
      'FINALIZADO': { label: 'Finalizado', className: 'bg-success text-success-foreground' },
      'CONCLUIDO': { label: 'Concluído', className: 'bg-success text-success-foreground' },
      'EM_ESPERA': { label: 'Em Espera', className: 'bg-warning text-warning-foreground' },
      'PARALISADO': { label: 'Paralisado', className: 'bg-destructive text-destructive-foreground' },
      'AGUARDANDO_PAGAMENTO': { label: 'Aguardando Pagamento', className: 'bg-secondary text-secondary-foreground' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };


  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || project.status === statusFilter;
    const matchesType = typeFilter === 'todos' || project.type === typeFilter;
    const matchesResponsible = responsibleFilter === 'todos' || project.responsible_ids.includes(responsibleFilter);

    // Filtro de vigência
    let matchesVigencia = true;
    if (vigenciaFilter !== 'todos' && project.prazo_vigencia) {
      const vigenciaDate = new Date(project.prazo_vigencia);
      const today = new Date();

      switch (vigenciaFilter) {
        case 'vencidos':
          matchesVigencia = vigenciaDate < today;
          break;
        case 'proximos_30':
          const em30Dias = new Date();
          em30Dias.setDate(today.getDate() + 30);
          matchesVigencia = vigenciaDate >= today && vigenciaDate <= em30Dias;
          break;
        case 'vigentes':
          matchesVigencia = vigenciaDate >= today;
          break;
      }
    } else if (vigenciaFilter !== 'todos' && !project.prazo_vigencia) {
      matchesVigencia = vigenciaFilter === 'sem_vigencia';
    }

    return matchesSearch && matchesStatus && matchesType && matchesResponsible && matchesVigencia;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getResponsibleNames = (responsibleIds: string[]) => {
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

    return responsibleIds
      .map(id => teamMembers.find(member => member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
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
            <div className="space-y-4">
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
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                    <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                    <SelectItem value="PARALISADO">Paralisado</SelectItem>
                    <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Responsáveis</SelectItem>
                    <SelectItem value="1">Igor</SelectItem>
                    <SelectItem value="2">Gustavo</SelectItem>
                    <SelectItem value="3">Bessa</SelectItem>
                    <SelectItem value="4">Leonardo</SelectItem>
                    <SelectItem value="5">Pedro</SelectItem>
                    <SelectItem value="6">Thiago</SelectItem>
                    <SelectItem value="7">Nicolas</SelectItem>
                    <SelectItem value="8">Eloisy</SelectItem>
                    <SelectItem value="9">Rondinelly</SelectItem>
                    <SelectItem value="10">Edilson</SelectItem>
                    <SelectItem value="11">Stael</SelectItem>
                    <SelectItem value="12">Philip</SelectItem>
                    <SelectItem value="13">Nara</SelectItem>
                    <SelectItem value="14">Projetista Externo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={vigenciaFilter} onValueChange={setVigenciaFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Vigência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas Vigências</SelectItem>
                    <SelectItem value="vencidos">Vencidos</SelectItem>
                    <SelectItem value="proximos_30">Próximos 30 dias</SelectItem>
                    <SelectItem value="vigentes">Vigentes</SelectItem>
                    <SelectItem value="sem_vigencia">Sem vigência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <TableHead>Prazo de Vigência</TableHead>
                    <TableHead>Responsáveis</TableHead>
                    <TableHead>Contrato</TableHead>
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
                      <TableCell>
                        {project.prazo_vigencia ? formatDate(project.prazo_vigencia) : 'Não definido'}
                      </TableCell>
                      <TableCell className="max-w-48">
                        <div className="truncate" title={getResponsibleNames(project.responsible_ids)}>
                          {getResponsibleNames(project.responsible_ids) || 'Não atribuído'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(project.contract_start)} - {formatDate(project.contract_end)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewProject(project)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleEditProject(project)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProject(project)}>
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

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        project={selectedProject}
        mode={modalMode}
      />
    </div>
  );
};

export default Projetos;