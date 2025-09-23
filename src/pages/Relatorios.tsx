import { motion } from 'framer-motion';
import { BarChart3, FileDown, Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';

const Relatorios = () => {
  const { user } = useAuth();
  const { projects, tasks } = useAppData();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  // Estatísticas básicas para relatórios
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'EM_ANDAMENTO').length;
  const completedProjects = projects.filter(p => p.status === 'CONCLUIDO' || p.status === 'FINALIZADO').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'CONCLUIDA').length;
  const activeTasks = tasks.filter(t => t.status === 'EM_ANDAMENTO').length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Análise e relatórios do sistema de gestão</p>
      </motion.div>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} ativos • {completedProjects} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {activeTasks} em andamento • {completedTasks} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Performance geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Geradores de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Desempenho da Equipe
            </CardTitle>
            <CardDescription>Relatório de produtividade e pontuação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Input type="date" defaultValue="2025-01-01" />
                <Input type="date" defaultValue="2025-12-31" />
              </div>
            </div>
            <Button className="w-full" onClick={() => alert('Funcionalidade em desenvolvimento')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-success" />
              Cronograma de Projetos
            </CardTitle>
            <CardDescription>Timeline e status dos projetos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  <SelectItem value="PARALISADO">Paralisado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => alert('Funcionalidade em desenvolvimento')}>
              <Calendar className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileDown className="h-5 w-5 mr-2 text-accent" />
              Relatório de Tarefas
            </CardTitle>
            <CardDescription>Análise completa das atividades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concluidas">Tarefas Concluídas</SelectItem>
                  <SelectItem value="pendentes">Tarefas Pendentes</SelectItem>
                  <SelectItem value="completo">Relatório Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => alert('Funcionalidade em desenvolvimento')}>
              <FileDown className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;