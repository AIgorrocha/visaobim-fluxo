import { motion } from 'framer-motion';
import { User, Bell, Settings, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { user, profile, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isAdmin = profile?.role === 'admin';

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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="perfil" className="text-xs md:text-sm">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs md:text-sm">Notificações</TabsTrigger>
          <TabsTrigger value="preferencias" className="text-xs md:text-sm">Preferências</TabsTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  placeholder="(11) 99999-9999"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
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
                <Switch id="email-notifications" />
                <Label htmlFor="email-notifications">Notificações por e-mail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="task-notifications" />
                <Label htmlFor="task-notifications">Notificações de tarefas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="project-notifications" />
                <Label htmlFor="project-notifications">Notificações de projetos</Label>
              </div>
              <Button onClick={() => alert('Funcionalidade em desenvolvimento')}>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Preferências
              </CardTitle>
              <CardDescription>Personalize sua experiência no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Modo escuro</Label>
                  <p className="text-xs text-muted-foreground">
                    Alterne entre tema claro e escuro
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
              <Button onClick={() => toast({ title: "Preferências salvas", description: "Suas configurações foram aplicadas." })}>
                Salvar Alterações
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
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade em desenvolvimento. Em breve você poderá gerenciar todos os usuários do sistema.
                </p>
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
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações avançadas do sistema serão implementadas em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Configuracoes;