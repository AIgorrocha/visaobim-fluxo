import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, TrendingUp, Clock, CheckCircle,
  Search, Filter, Eye, Edit, Plus, UserPlus, Shield, User,
  Calendar, Mail, Phone, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useUserData } from '@/hooks/useUserData';
import ProfileModal from '@/components/ProfileModal';
import { Profile } from '@/types';

const Equipe = () => {
  const { user, profile } = useAuth();
  const { profiles, tasks, projects } = useSupabaseData();
  const { getUserProjects, getUserTasks } = useUserData();

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const isAdmin = profile?.role === 'admin';

  // Preparar dados da equipe com estatísticas
  const teamWithStats = profiles.map(member => {
    const memberTasks = getUserTasks(member.id);
    const memberProjects = getUserProjects(member.id);
    const completedTasks = memberTasks.filter(t => t.status === 'CONCLUIDA');
    const activeTasks = memberTasks.filter(t => t.status === 'EM_ANDAMENTO' || t.status === 'PENDENTE');

    // Calcular última atividade (última tarefa atualizada)
    const lastActivity = memberTasks.length > 0
      ? new Date(Math.max(...memberTasks.map(t => new Date(t.created_at).getTime())))
      : null;

    // Status do usuário baseado na última atividade
    const daysSinceLastActivity = lastActivity
      ? Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const userStatus = daysSinceLastActivity <= 1 ? 'ativo' :
                      daysSinceLastActivity <= 7 ? 'recente' : 'inativo';

    return {
      ...member,
      tasks: memberTasks.length,
      projects: memberProjects.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      lastActivity,
      userStatus,
    };
  });

  // Filtrar e ordenar equipe
  const filteredAndSortedTeam = teamWithStats
    .filter(member => {
      const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'todos' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'todos' || member.userStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => b.completedTasks - a.completedTasks);

  // Estatísticas gerais
  const totalMembers = profiles.length;
  const activeMembers = teamWithStats.filter(m => m.userStatus === 'ativo').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'CONCLUIDA').length;

  // Funções do modal
  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    if (!isAdmin && profile.id !== user?.id) return;
    setSelectedProfile(profile);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateProfile = () => {
    if (!isAdmin) return;
    setSelectedProfile(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  // Formatação
  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('pt-BR');
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'admin': { label: 'Administrador', className: 'bg-destructive text-destructive-foreground' },
      'user': { label: 'Usuário', className: 'bg-secondary text-secondary-foreground' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ativo': { label: 'Ativo', className: 'bg-success text-success-foreground' },
      'recente': { label: 'Ativo Recente', className: 'bg-warning text-warning-foreground' },
      'inativo': { label: 'Inativo', className: 'bg-muted text-muted-foreground' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
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
          <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o desempenho da equipe
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleCreateProfile}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Membro
          </Button>
        )}
      </motion.div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Membros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="text-2xl font-bold">{activeMembers}</p>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-success" />
                <div>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                  <p className="text-xs text-muted-foreground">Total Tarefas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Projetos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Funções</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="recente">Ativo Recente</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela da Equipe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Membros da Equipe</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tarefas</TableHead>
                    <TableHead>Projetos</TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTeam.length > 0 ? (
                    filteredAndSortedTeam.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url} />
                              <AvatarFallback>
                                {(member.full_name || member.email)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.full_name || 'Sem nome'}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.userStatus)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{member.tasks}</span>
                            <div className="text-muted-foreground">
                              {member.completedTasks} concluídas
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{member.projects}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(member.lastActivity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => handleViewProfile(member)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(isAdmin || member.id === user?.id) && (
                              <Button size="sm" variant="ghost" onClick={() => handleEditProfile(member)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">Nenhum membro encontrado</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        profile={selectedProfile}
        mode={modalMode}
      />
    </div>
  );
};

export default Equipe;