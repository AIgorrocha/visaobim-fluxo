import { motion } from 'framer-motion';
import { User, Bell, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Estados para configurações de notificação
  const [notificationSettings, setNotificationSettings] = useState({
    notification_email: true,
    notification_tasks: true,
    notification_projects: true,
    notification_restrictions: true,
    performance_reports: false
  });

  // Estados para configurações de sistema (apenas admin)
  const [systemSettings, setSystemSettings] = useState({
    early_points: 2,
    late_points: 4,
    urgent_days: 7,
    reminder_days: 3,
    auto_backup: true,
    user_registration: false,
    public_projects: true,
    global_reports: true
  });

  // Definir se é admin
  const isAdmin = profile?.role === 'admin';

  // Carregar configurações do usuário
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações:', error);
          return;
        }

        if (data) {
          setNotificationSettings({
            notification_email: data.notification_email ?? true,
            notification_tasks: data.notification_tasks ?? true,
            notification_projects: data.notification_projects ?? true,
            notification_restrictions: data.notification_restrictions ?? true,
            performance_reports: data.performance_reports ?? false
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadUserSettings();
  }, [user]);

  // Carregar configurações do sistema (apenas admin)
  useEffect(() => {
    const loadSystemSettings = async () => {
      if (!isAdmin) return;

      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações do sistema:', error);
          return;
        }

        if (data) {
          setSystemSettings({
            early_points: data.early_points ?? 2,
            late_points: data.late_points ?? 4,
            urgent_days: data.urgent_days ?? 7,
            reminder_days: data.reminder_days ?? 3,
            auto_backup: data.auto_backup ?? true,
            user_registration: data.user_registration ?? false,
            public_projects: data.public_projects ?? true,
            global_reports: data.global_reports ?? true
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do sistema:', error);
      }
    };

    loadSystemSettings();
  }, [isAdmin]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Atualizar profile no Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name
        })
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar email no auth do Supabase se mudou
      if (profileData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        if (authError) throw authError;
      }

      // Atualizar contexto local
      await updateProfile({
        full_name: profileData.full_name,
        email: profileData.email
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "A confirmação da senha não confere.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Função para salvar configurações de notificação
  const handleSaveNotificationSettings = async () => {
    setSettingsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...notificationSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Função para salvar configurações do sistema (apenas admin)
  const handleSaveSystemSettings = async () => {
    setSettingsLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          ...systemSettings,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Configurações aplicadas",
        description: "Configurações do sistema foram atualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
      </motion.div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="perfil" className="text-xs md:text-sm">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs md:text-sm">Notificações</TabsTrigger>
          {isAdmin && <TabsTrigger value="usuarios" className="text-xs md:text-sm">Usuários</TabsTrigger>}
          {isAdmin && <TabsTrigger value="sistema" className="text-xs md:text-sm">Sistema</TabsTrigger>}
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Meu Perfil
              </CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>

              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                  variant="outline"
                >
                  {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações
              </CardTitle>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.notification_email}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, notification_email: checked }))
                  }
                />
                <Label htmlFor="email-notifications">Notificações por e-mail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="task-notifications"
                  checked={notificationSettings.notification_tasks}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, notification_tasks: checked }))
                  }
                />
                <Label htmlFor="task-notifications">Notificações de tarefas (prazos e atrasos)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="project-notifications"
                  checked={notificationSettings.notification_projects}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, notification_projects: checked }))
                  }
                />
                <Label htmlFor="project-notifications">Notificações de projetos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="restriction-notifications"
                  checked={notificationSettings.notification_restrictions}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, notification_restrictions: checked }))
                  }
                />
                <Label htmlFor="restriction-notifications">Alertas de restrições e bloqueios</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="performance-reports"
                  checked={notificationSettings.performance_reports}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, performance_reports: checked }))
                  }
                />
                <Label htmlFor="performance-reports">Relatórios semanais de desempenho</Label>
              </div>
              <Button onClick={handleSaveNotificationSettings} disabled={settingsLoading}>
                {settingsLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


        {isAdmin && (
          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription>Gerencie os usuários do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Controle de Acesso</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="user-registration"
                        checked={systemSettings.user_registration}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, user_registration: checked }))
                        }
                      />
                      <Label htmlFor="user-registration">Permitir auto-registro de novos usuários</Label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Permissões de Projeto</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="public-projects"
                        checked={systemSettings.public_projects}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, public_projects: checked }))
                        }
                      />
                      <Label htmlFor="public-projects">Projetos públicos visíveis para todos</Label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Relatórios</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="global-reports"
                        checked={systemSettings.global_reports}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, global_reports: checked }))
                        }
                      />
                      <Label htmlFor="global-reports">Administradores podem gerar relatórios de qualquer usuário</Label>
                    </div>
                  </div>

                  <Button onClick={handleSaveSystemSettings} disabled={settingsLoading}>
                    {settingsLoading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Configurações gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sistema de Pontuação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="early-points">Pontos por dia antecipado</Label>
                        <Input
                          id="early-points"
                          type="number"
                          value={systemSettings.early_points}
                          onChange={(e) =>
                            setSystemSettings(prev => ({ ...prev, early_points: parseInt(e.target.value) || 2 }))
                          }
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="late-points">Pontos negativos por dia atrasado</Label>
                        <Input
                          id="late-points"
                          type="number"
                          value={systemSettings.late_points}
                          onChange={(e) =>
                            setSystemSettings(prev => ({ ...prev, late_points: parseInt(e.target.value) || 4 }))
                          }
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Prazos e Alertas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="urgent-days">Dias para tarefa ser considerada urgente</Label>
                        <Input
                          id="urgent-days"
                          type="number"
                          value={systemSettings.urgent_days}
                          onChange={(e) =>
                            setSystemSettings(prev => ({ ...prev, urgent_days: parseInt(e.target.value) || 7 }))
                          }
                          min="1"
                          max="30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder-days">Dias antes do prazo para lembrete</Label>
                        <Input
                          id="reminder-days"
                          type="number"
                          value={systemSettings.reminder_days}
                          onChange={(e) =>
                            setSystemSettings(prev => ({ ...prev, reminder_days: parseInt(e.target.value) || 3 }))
                          }
                          min="1"
                          max="15"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Backup e Manutenção</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-backup"
                        checked={systemSettings.auto_backup}
                        onCheckedChange={(checked) =>
                          setSystemSettings(prev => ({ ...prev, auto_backup: checked }))
                        }
                      />
                      <Label htmlFor="auto-backup">Backup automático diário dos dados</Label>
                    </div>
                  </div>

                  <Button onClick={handleSaveSystemSettings} disabled={settingsLoading}>
                    {settingsLoading ? 'Aplicando...' : 'Aplicar Configurações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Configuracoes;