import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Edit, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import ProjectModal from '@/components/ProjectModal';
import { Project } from '@/types';

const Projetos = () => {
  const { user, profile } = useAuth();
  const { projects, deleteProject, updateProject, profiles } = useSupabaseData();

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
  const [contractEndFilter, setContractEndFilter] = useState<string>('todos');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  if (!user) return null;

  const isAdmin = profile?.role === 'admin';
  const allProjects = isAdmin ? projects : getProjectsByUser(user.id);
  
  // Filtrar por status de arquivamento
  const projectsToShow = allProjects.filter(project => 
    showArchived ? project.is_archived : !project.is_archived
  );

  const getStatusBadge = (status: Project['status']) => {
    const statusConfig = {
      'EM_ANDAMENTO': { label: 'Em Andamento', className: 'bg-primary text-primary-foreground' },
      'CONCLUIDO': { label: 'Concluído', className: 'bg-success text-success-foreground' },
      'EM_ESPERA': { label: 'Em Espera', className: 'bg-warning text-warning-foreground' },
      'PARALISADO': { label: 'Paralisado', className: 'bg-destructive text-destructive-foreground' },
      'AGUARDANDO_PAGAMENTO': { label: 'Aguardando Pagamento', className: 'bg-secondary text-secondary-foreground' },
      'AGUARDANDO_APROVACAO': { label: 'Aguardando Aprovação', className: 'bg-amber-500 text-white' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };


  // Filtragem básica (sem vigência e contrato)
  const baseFilteredProjects = projectsToShow.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || project.status === statusFilter;
    const matchesType = typeFilter === 'todos' || project.type === typeFilter;
    const matchesResponsible = responsibleFilter === 'todos' || project.responsible_ids.includes(responsibleFilter);

    return matchesSearch && matchesStatus && matchesType && matchesResponsible;
  });

  // Aplicação da ordenação por prazo de contrato
  const filteredProjects = [...baseFilteredProjects].sort((a, b) => {
    // Ordenação por fim de contrato
    if (contractEndFilter === 'prazo_asc' || contractEndFilter === 'prazo_desc') {
      const dateA = a.contract_end ? new Date(a.contract_end).getTime() : Infinity;
      const dateB = b.contract_end ? new Date(b.contract_end).getTime() : Infinity;

      if (contractEndFilter === 'prazo_asc') {
        return dateA - dateB; // Mais próximo primeiro
      } else {
        return dateB - dateA; // Mais distante primeiro
      }
    }

    return 0; // Sem ordenação
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getResponsibleNames = (responsibleIds: string[]) => {
    return responsibleIds
      .map(id => profiles.find(profile => profile.id === id)?.full_name || profiles.find(profile => profile.id === id)?.email)
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
  
  const handleArchiveProject = async (project: Project) => {
    await updateProject(project.id, { is_archived: !project.is_archived });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gerencie todos os projetos da empresa' : 'Seus projetos atribuídos'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={showArchived ? "default" : "outline"} 
            className="w-full sm:w-auto" 
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
          </Button>
          
          {isAdmin && (
            <Button className="w-full sm:w-auto" onClick={handleNewProject}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          )}
        </div>
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
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                    <SelectItem value="EM_ESPERA">Em Espera</SelectItem>
                    <SelectItem value="PARALISADO">Paralisado</SelectItem>
                    <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</SelectItem>
                    <SelectItem value="AGUARDANDO_APROVACAO">Aguardando Aprovação</SelectItem>
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
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name || profile.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>


                <Select value={contractEndFilter} onValueChange={setContractEndFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Ordenar por Contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Sem ordenação</SelectItem>
                    <SelectItem value="prazo_asc">Prazo: Mais próximo primeiro</SelectItem>
                    <SelectItem value="prazo_desc">Prazo: Mais distante primeiro</SelectItem>
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
                    <TableHead>ART</TableHead>
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
                      <TableCell>
                        {project.art_emitida ? (
                          <Badge className="bg-success text-success-foreground">✅ Sim</Badge>
                        ) : (
                          <Badge variant="outline" className="text-destructive border-destructive">❌ Não</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 justify-start text-left"
                          onClick={() => handleViewProject(project)}
                        >
                          <div className="text-primary hover:underline">
                            {project.responsible_ids && project.responsible_ids.length > 0
                              ? `${project.responsible_ids.length} responsável(is)`
                              : 'Não atribuído'
                            }
                          </div>
                        </Button>
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
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleArchiveProject(project)}
                                title={project.is_archived ? "Desarquivar" : "Arquivar"}
                              >
                                {project.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
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