import { motion } from 'framer-motion';
import { User, Bell, Settings, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Configuracoes = () => {
  const { user, profile } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
      </motion.div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
          {isAdmin && <TabsTrigger value="usuarios">Usuários</TabsTrigger>}
          {isAdmin && <TabsTrigger value="sistema">Sistema</TabsTrigger>}
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
                <Input id="name" defaultValue={profile?.full_name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" />
              </div>
              <Button onClick={() => alert('Funcionalidade em desenvolvimento')}>Salvar Alterações</Button>
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
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode">Modo escuro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="compact-view" />
                <Label htmlFor="compact-view">Visualização compacta</Label>
              </div>
              <Button onClick={() => alert('Funcionalidade em desenvolvimento')}>Salvar Alterações</Button>
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