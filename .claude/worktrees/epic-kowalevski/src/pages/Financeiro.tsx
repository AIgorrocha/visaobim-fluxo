import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Financeiro = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Módulo Financeiro</h1>
        <p className="text-muted-foreground">Sistema de gestão financeira em desenvolvimento</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                Módulo Financeiro em Desenvolvimento
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Estamos trabalhando para trazer as melhores ferramentas de gestão financeira para sua equipe. 
                Em breve você terá acesso a relatórios completos, fluxo de caixa e muito mais.
              </p>
              
              {/* Roadmap */}
              <div className="bg-muted/30 rounded-lg p-6 max-w-2xl w-full">
                <h3 className="font-semibold mb-4 text-center">🚀 Próximas Funcionalidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Controle de receitas e despesas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Relatórios financeiros detalhados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Fluxo de caixa projetado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Análise de rentabilidade por projeto</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span>Integração bancária automática</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span>Dashboard financeiro executivo</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-muted">
                  <div className="flex items-center justify-center space-x-4">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Em desenvolvimento ativo
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Próximo release
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Financeiro;