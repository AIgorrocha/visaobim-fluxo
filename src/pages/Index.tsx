import { motion } from 'framer-motion';
import { ArrowRight, LogIn, Users, CheckSquare, BarChart3, Trophy, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return null; // Vai redirecionar para dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Visão BIM CRM</h1>
          </div>
          <Button onClick={() => navigate('/login')} variant="outline">
            <LogIn className="w-4 h-4 mr-2" />
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Sistema de Gestão
              <br />
              BIM Inteligente
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Plataforma completa para gerenciamento de projetos BIM, equipes e produtividade.
              Controle total sobre projetos, tarefas, conquistas e relatórios em um só lugar.
            </p>
            
            <Alert className="max-w-2xl mx-auto mb-8 border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Sistema Seguro:</strong> Implementação completa de Row Level Security (RLS) 
                para proteção máxima dos dados empresariais e pessoais.
              </AlertDescription>
            </Alert>

            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-3"
            >
              Acessar Sistema
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Funcionalidades Principais
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CheckSquare className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Gestão de Projetos</CardTitle>
                  <CardDescription>
                    Controle completo de projetos BIM, prazos, responsáveis e status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Acompanhamento de status em tempo real</li>
                    <li>• Gestão de contratos e valores</li>
                    <li>• Controle de responsabilidades</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Gerenciamento de Equipe</CardTitle>
                  <CardDescription>
                    Sistema completo para gerenciar equipes e produtividade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Atribuição inteligente de tarefas</li>
                    <li>• Sistema de dependências</li>
                    <li>• Notificações em tempo real</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Trophy className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Sistema de Conquistas</CardTitle>
                  <CardDescription>
                    Gamificação para motivar e reconhecer a equipe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Pontuação por desempenho</li>
                    <li>• Níveis e reconhecimentos</li>
                    <li>• Relatórios de produtividade</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Relatórios Avançados</CardTitle>
                  <CardDescription>
                    Analytics completos para tomada de decisão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Dashboards personalizados</li>
                    <li>• Métricas de desempenho</li>
                    <li>• Exportação de dados</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Zap className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Automação Inteligente</CardTitle>
                  <CardDescription>
                    Fluxos automatizados para maior eficiência
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Notificações automáticas</li>
                    <li>• Resolução de dependências</li>
                    <li>• Cálculos de pontuação</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Lock className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Segurança Máxima</CardTitle>
                  <CardDescription>
                    Proteção completa de dados empresariais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Row Level Security (RLS)</li>
                    <li>• Controle de acesso por roles</li>
                    <li>• Auditoria de ações</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-3xl font-bold mb-6">
              Pronto para transformar sua gestão BIM?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Acesse o sistema e descubra como otimizar seus projetos e equipes
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-3"
            >
              Entrar no Sistema
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Visão BIM CRM - Sistema de Gestão Inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;