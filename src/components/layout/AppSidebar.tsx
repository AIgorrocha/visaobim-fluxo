import { useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Wallet,
  Calculator
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

// Emails com acesso restrito a areas financeiras
const RESTRICTED_EMAILS = ['igor@visaobim.com', 'stael@visaobim.com'];

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
    title: 'Meu Financeiro',
    url: '/meu-financeiro',
    icon: Wallet,
    roles: ['admin', 'user']
  },
  {
    title: 'Precificacao',
    url: '/precificacao',
    icon: Calculator,
    roles: ['admin'],
    restrictedEmails: RESTRICTED_EMAILS
  },
  {
    title: 'Gestao Financeira',
    url: '/admin-financeiro',
    icon: DollarSign,
    roles: ['admin'],
    restrictedEmails: RESTRICTED_EMAILS
  },
  {
    title: 'Propostas',
    url: '/propostas',
    icon: FileText,
    roles: ['admin'],
    restrictedEmails: RESTRICTED_EMAILS
  },
  { title: "Relatorios", url: "/relatorios", icon: BarChart3, roles: ["admin", "user"] },
  {
    title: 'Configuracoes',
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

  const userEmail = profile?.email?.toLowerCase() || '';

  const filteredMenuItems = menuItems.filter(item => {
    // Verificar se o role tem acesso
    if (!profile?.role || !item.roles.includes(profile.role)) {
      return false;
    }
    // Se tem restricao de email, verificar se o usuario esta na lista
    if (item.restrictedEmails && !item.restrictedEmails.includes(userEmail)) {
      return false;
    }
    return true;
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
                    Usuário do sistema
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