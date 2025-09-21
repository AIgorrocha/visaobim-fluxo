import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProposals } from '@/data/mockData';

const Propostas = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
      'negociando': { label: 'Em Negociação', className: 'bg-warning text-warning-foreground' },
      'aprovada': { label: 'Aprovada', className: 'bg-success text-success-foreground' },
      'rejeitada': { label: 'Rejeitada', className: 'bg-destructive text-destructive-foreground' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const groupedProposals = {
    novas: mockProposals.filter(p => p.status === 'pendente'),
    negociando: mockProposals.filter(p => p.status === 'negociando'),
    aprovadas: mockProposals.filter(p => p.status === 'aprovada'),
    rejeitadas: mockProposals.filter(p => p.status === 'rejeitada')
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Propostas</h1>
          <p className="text-muted-foreground">Acompanhe o pipeline de vendas</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Proposta
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(groupedProposals).map(([key, proposals], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">
                  {key === 'novas' ? 'Novas' : 
                   key === 'negociando' ? 'Em Negociação' :
                   key === 'aprovadas' ? 'Aprovadas' : 'Rejeitadas'}
                </CardTitle>
                <CardDescription>{proposals.length} propostas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{proposal.client_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(proposal.proposal_value)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(proposal.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(proposal.proposal_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Propostas;