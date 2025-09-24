import React, { useState } from 'react';
import { Bell, Settings, LogOut, User, Menu, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useNavigate } from 'react-router-dom';
import { TaskNotificationSystem } from '@/components/TaskNotificationSystem';
import { useToast } from '@/hooks/use-toast';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { refetchAllData } = useSupabaseData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchAllData();
      toast({
        title: "Dados atualizados",
        description: "Todos os dados foram sincronizados com o Supabase.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível atualizar os dados. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLevelName = (level: number) => {
    const levels = [
      'Iniciante', 'Aprendiz', 'Profissional', 'Especialista', 'Mestre',
      'Expert', 'Sênior', 'Líder', 'Campeão', 'Lenda'
    ];
    return levels[level - 1] || 'Iniciante';
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <SidebarTrigger />
          <h1 className="text-lg sm:text-xl font-bold text-primary truncate">
            <span className="hidden sm:inline">Visão Projetos BIM</span>
            <span className="sm:hidden">Visão BIM</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="hidden sm:flex"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="ml-2">Atualizar dados</span>
          </Button>

          {/* Notifications */}
          <TaskNotificationSystem />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 sm:w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        Nível {profile?.level || 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getLevelName(profile?.level || 1)}
                      </span>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">
                      {profile?.points || 0} pontos
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRefreshData} disabled={isRefreshing} className="sm:hidden">
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar dados</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};