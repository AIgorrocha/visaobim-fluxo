import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Trophy, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const menuItems = [
  {
    title: 'Painel',
    url: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'user']
  },
  {
    title: 'Projetos',
    url: '/projetos',
    icon: FolderOpen,
    roles: ['admin', 'user']
  },
  {
    title: 'Minhas Tarefas',
    url: '/minhas-tarefas',
    icon: CheckSquare,
    roles: ['admin', 'user']
  },
  {
    title: 'Equipe',
    url: '/equipe',
    icon: Users,
    roles: ['admin', 'user']
  },
  {
    title: 'Conquistas',
    url: '/conquistas',
    icon: Trophy,
    roles: ['admin', 'user']
  },
  {
    title: 'Financeiro',
    url: '/financeiro',
    icon: DollarSign,
    roles: ['admin']
  },
  {
    title: 'Propostas',
    url: '/propostas',
    icon: FileText,
    roles: ['admin']
  },
  {
    title: 'Relatórios',
    url: '/relatorios',
    icon: BarChart3,
    roles: ['admin', 'user']
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
    roles: ['admin', 'user']
  }
];

export function AppSidebar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = (path: string) => {
    return isActive(path) 
      ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90' 
      : 'hover:bg-accent hover:text-accent-foreground';
  };

  const filteredMenuItems = menuItems.filter(item =>
    profile?.role && item.roles.includes(profile.role)
  );

  // Debug temporário
  console.log('🔍 DEBUG AppSidebar:', {
    userEmail: user?.email,
    profileRole: profile?.role,
    profileName: profile?.full_name,
    totalMenuItems: menuItems.length,
    filteredMenuItems: filteredMenuItems.length,
    filteredTitles: filteredMenuItems.map(item => item.title)
  });

  return (
    <Sidebar className="w-64">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && profile && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent className="px-4 py-3 border-t">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile.points || 0} pontos • Nível {profile.level || 1}
                  </p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}