import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useDesignerFinancialSummary, useDesignerPayments } from '@/hooks/useDesignerFinancials';
import { DesignerPayment, DesignerReceivable } from '@/types';

// Formatar valores em BRL
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const MeuFinanceiro = () => {
  const { user, profile } = useAuth();
  const { summary, receivables, loading: summaryLoading } = useDesignerFinancialSummary(user?.id || '');
  const { payments, loading: paymentsLoading } = useDesignerPayments(user?.id);

  // Estados para filtros
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [showReceivables, setShowReceivables] = useState(true);
  const [showPayments, setShowPayments] = useState(true);

  // Extrair disciplinas únicas e anos únicos dos pagamentos
  const uniqueDisciplines = useMemo(() => {
    const disciplines = new Set(payments.map(p => p.discipline));
    return Array.from(disciplines).sort();
  }, [payments]);

  const uniqueYears = useMemo(() => {
    const years = new Set(payments.map(p => p.payment_date.substring(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [payments]);

  // Filtrar pagamentos
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (filterSector !== 'all' && p.sector !== filterSector) return false;
      if (filterDiscipline !== 'all' && p.discipline !== filterDiscipline) return false;
      if (filterYear !== 'all' && !p.payment_date.startsWith(filterYear)) return false;
      return true;
    });
  }, [payments, filterSector, filterDiscipline, filterYear]);

  // Calcular totais filtrados
  const filteredTotal = useMemo(() => {
    return filteredPayments.reduce((sum, p) =>
      p.status === 'pago' ? sum + Number(p.amount) : sum, 0
    );
  }, [filteredPayments]);

  if (!user || !profile) return null;

  const loading = summaryLoading || paymentsLoading;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Meu Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe seus pagamentos e valores a receber
        </p>
      </motion.div>

      {/* Cards de Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Recebido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : formatCurrency(summary?.totalReceived || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalPayments || 0} pagamentos
            </p>
          </CardContent>
        </Card>

        {/* A Receber */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : formatCurrency(summary?.totalPending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivables.length} disciplinas pendentes
            </p>
          </CardContent>
        </Card>

        {/* Projetos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : summary?.projectsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              projetos trabalhados
            </p>
          </CardContent>
        </Card>

        {/* Ultimo Pagamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimo Pagamento</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading || !summary?.lastPaymentDate
                ? '-'
                : formatDate(summary.lastPaymentDate)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              data do ultimo pagamento
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Valores a Receber */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Collapsible open={showReceivables} onOpenChange={setShowReceivables}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-500" />
                      Valores a Receber
                    </CardTitle>
                    <CardDescription>
                      Disciplinas precificadas com pagamento pendente
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600">
                      {formatCurrency(summary?.totalPending || 0)}
                    </Badge>
                    {showReceivables ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-4">Carregando...</p>
                ) : receivables.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum valor a receber no momento
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">Sua Parte (40%)</TableHead>
                        <TableHead className="text-right">Ja Pago</TableHead>
                        <TableHead className="text-right">A Receber</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivables.map((item, index) => (
                        <TableRow key={`${item.project_id}-${item.discipline_name}-${index}`}>
                          <TableCell className="font-medium">{item.project_name}</TableCell>
                          <TableCell>{item.discipline_name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_value)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.designer_value)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(item.amount_paid)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-yellow-600">
                            {formatCurrency(item.amount_pending)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Historico de Pagamentos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Collapsible open={showPayments} onOpenChange={setShowPayments}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-green-500" />
                      Historico de Pagamentos
                    </CardTitle>
                    <CardDescription>
                      Todos os pagamentos recebidos
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      {filteredPayments.length} pagamentos
                    </Badge>
                    {showPayments ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filtros:</span>
                  </div>

                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {uniqueYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterSector} onValueChange={setFilterSector}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="privado">Privado</SelectItem>
                      <SelectItem value="publico">Publico</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueDisciplines.map(disc => (
                        <SelectItem key={disc} value={disc}>{disc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(filterSector !== 'all' || filterDiscipline !== 'all' || filterYear !== 'all') && (
                    <div className="ml-auto">
                      <Badge variant="secondary">
                        Total filtrado: {formatCurrency(filteredTotal)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Tabela de Pagamentos */}
                {loading ? (
                  <p className="text-center text-muted-foreground py-4">Carregando...</p>
                ) : filteredPayments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum pagamento encontrado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell className="font-medium">
                            {payment.project_name || '-'}
                          </TableCell>
                          <TableCell>{payment.discipline}</TableCell>
                          <TableCell>
                            <Badge variant={payment.sector === 'publico' ? 'default' : 'secondary'}>
                              {payment.sector === 'publico' ? 'Publico' : 'Privado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === 'pago' ? 'default' :
                                payment.status === 'pendente' ? 'secondary' : 'destructive'
                              }
                              className={
                                payment.status === 'pago' ? 'bg-green-500' :
                                payment.status === 'pendente' ? 'bg-yellow-500' : ''
                              }
                            >
                              {payment.status === 'pago' ? 'Pago' :
                               payment.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Resumo por Disciplina e Projeto */}
      {summary && (summary.paymentsByDiscipline.length > 0 || summary.paymentsByProject.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Por Disciplina */}
          {summary.paymentsByDiscipline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recebido por Disciplina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.paymentsByDiscipline.slice(0, 5).map((item, index) => (
                    <div key={item.discipline} className="flex justify-between items-center">
                      <span className="text-sm">{item.discipline}</span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Por Projeto */}
          {summary.paymentsByProject.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recebido por Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.paymentsByProject.slice(0, 5).map((item, index) => (
                    <div key={item.project_name} className="flex justify-between items-center">
                      <span className="text-sm truncate max-w-[200px]">{item.project_name}</span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MeuFinanceiro;
