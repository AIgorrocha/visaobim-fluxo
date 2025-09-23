import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Financeiro = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground">Módulo financeiro em desenvolvimento</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-warning" />
            Módulo em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Os dados financeiros serão implementados posteriormente com as informações corretas.
            Esta seção ficará disponível em breve.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;