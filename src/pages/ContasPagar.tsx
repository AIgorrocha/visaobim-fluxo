import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Pencil, Trash2, CheckCircle, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAllProjects } from '@/hooks/useContractFinancials';
import { useSectorAccess } from '@/hooks/useSectorAccess';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ADMIN_FINANCIAL_EMAILS = ['igor@visaobim.com', 'stael@visaobim.com'];

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const COST_CENTERS = ['CONTABILIDADE','PORTAL','CREA/CAU','TAXAS','IMPOSTOS','PROLABORE','OUTROS','PATROCINADOS','CONTEUDO','PROSPECCAO ATIVA','IA','LEVANTAMENTOS','PROJETISTA','PAGAMENTO','GERAL','JUNTO SEGUROS','FORSETI'];

interface PayableForm {
  id?: string;
  description: string;
  vendor: string;
  amount: string;
  due_date: string;
  status: 'aberto' | 'pago' | 'atrasado' | 'cancelado';
  cost_center: string;
  sector: 'publico' | 'privado' | 'geral';
  project_id: string;
  is_recurring: boolean;
  recurrence_period: string;
  notes: string;
}

const emptyForm: PayableForm = {
  description: '', vendor: '', amount: '', due_date: '',
  status: 'aberto', cost_center: 'OUTROS', sector: 'geral',
  project_id: '', is_recurring: false, recurrence_period: 'mensal', notes: ''
};

const ContasPagar = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const access = useSectorAccess();
  const { projects } = useAllProjects();
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'aberto' | 'atrasado' | 'pago'>('aberto');
  const [filterSector, setFilterSector] = useState<'all' | 'publico' | 'privado' | 'geral'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [form, setForm] = useState<PayableForm>(emptyForm);

  const isFinAdmin = ADMIN_FINANCIAL_EMAILS.includes(profile?.email?.toLowerCase() || '');

  const fetchPayables = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('accounts_payable') as any)
      .select('*, projects:project_id (name)')
      .order('due_date', { ascending: true });
    if (!error) setPayables(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPayables(); }, []);

  const filtered = useMemo(() => {
    return payables
      .filter(p => access.canViewPrivado || p.sector !== 'privado')
      .filter(p => filterStatus === 'all' || (filterStatus === 'atrasado' ? (p.status === 'aberto' && new Date(p.due_date) < new Date()) : p.status === filterStatus))
      .filter(p => filterSector === 'all' || p.sector === filterSector)
      .map(p => {
        const today = new Date();
        const due = new Date(p.due_date);
        const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = p.status === 'aberto' && days < 0;
        return { ...p, days_until: days, is_overdue: isOverdue, project_name: p.projects?.name };
      });
  }, [payables, filterStatus, filterSector]);

  const stats = useMemo(() => {
    const abertos = payables.filter(p => p.status === 'aberto');
    const atrasadas = abertos.filter(p => new Date(p.due_date) < new Date());
    const proximos7 = abertos.filter(p => {
      const d = (new Date(p.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return d >= 0 && d <= 7;
    });
    return {
      totalAberto: abertos.reduce((s, p) => s + Number(p.amount), 0),
      totalAtrasado: atrasadas.reduce((s, p) => s + Number(p.amount), 0),
      totalProx7: proximos7.reduce((s, p) => s + Number(p.amount), 0),
      countAberto: abertos.length,
      countAtrasado: atrasadas.length
    };
  }, [payables]);

  const aging = useMemo(() => {
    const buckets = {
      'atrasado': { bucket: 'Atrasado', total: 0, count: 0 },
      '0-7': { bucket: '0-7 dias', total: 0, count: 0 },
      '8-15': { bucket: '8-15 dias', total: 0, count: 0 },
      '16-30': { bucket: '16-30 dias', total: 0, count: 0 },
      '30+': { bucket: '30+ dias', total: 0, count: 0 }
    };
    const today = new Date();
    payables.filter(p => p.status === 'aberto').forEach(p => {
      const days = Math.ceil((new Date(p.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let key: keyof typeof buckets;
      if (days < 0) key = 'atrasado';
      else if (days <= 7) key = '0-7';
      else if (days <= 15) key = '8-15';
      else if (days <= 30) key = '16-30';
      else key = '30+';
      buckets[key].total += Number(p.amount);
      buckets[key].count += 1;
    });
    return Object.values(buckets);
  }, [payables]);

  if (!isFinAdmin) return <div className="p-6"><Card><CardContent className="pt-6 text-center text-muted-foreground">Acesso restrito.</CardContent></Card></div>;

  const openNew = () => { setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setForm({
      id: p.id, description: p.description, vendor: p.vendor || '',
      amount: String(p.amount), due_date: p.due_date,
      status: p.status, cost_center: p.cost_center || 'OUTROS',
      sector: p.sector || 'geral', project_id: p.project_id || '',
      is_recurring: !!p.is_recurring, recurrence_period: p.recurrence_period || 'mensal',
      notes: p.notes || ''
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.description || !form.amount || !form.due_date) {
      toast({ title: 'Preencha descrição, valor e vencimento', variant: 'destructive' });
      return;
    }
    const payload: any = {
      description: form.description,
      vendor: form.vendor || null,
      amount: Number(form.amount),
      due_date: form.due_date,
      status: form.status,
      cost_center: form.cost_center,
      sector: form.sector,
      project_id: form.project_id || null,
      is_recurring: form.is_recurring,
      recurrence_period: form.is_recurring ? form.recurrence_period : null,
      notes: form.notes || null
    };
    const { error } = form.id
      ? await (supabase.from('accounts_payable') as any).update(payload).eq('id', form.id)
      : await (supabase.from('accounts_payable') as any).insert([payload]);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: form.id ? 'Conta atualizada' : 'Conta cadastrada' });
    setDialogOpen(false);
    fetchPayables();
  };

  const del = async (id: string) => {
    const { error } = await (supabase.from('accounts_payable') as any).delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Conta removida' }); fetchPayables(); }
    setConfirmDel(null);
  };

  const markPaid = async (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await (supabase.from('accounts_payable') as any)
      .update({ status: 'pago', paid_date: today }).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Conta marcada como paga' }); fetchPayables(); }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><CreditCard className="h-7 w-7" /> Contas a Pagar</h1>
          <p className="text-muted-foreground">Gestão de fornecedores e despesas pendentes</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nova Conta</Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total em Aberto</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{fmtBRL(stats.totalAberto)}</div><p className="text-xs text-muted-foreground">{stats.countAberto} contas</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Atrasadas</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{fmtBRL(stats.totalAtrasado)}</div><p className="text-xs text-muted-foreground">{stats.countAtrasado} contas</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Vence próx. 7 dias</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{fmtBRL(stats.totalProx7)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Recorrentes ativas</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{payables.filter(p => p.is_recurring && p.status === 'aberto').length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Aging — Vencimentos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={aging}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} />
              <Bar dataKey="total" fill="#ef4444" name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <ToggleGroup type="single" value={filterStatus} onValueChange={(v) => v && setFilterStatus(v as any)}>
            <ToggleGroupItem value="aberto">Em aberto</ToggleGroupItem>
            <ToggleGroupItem value="atrasado">Atrasadas</ToggleGroupItem>
            <ToggleGroupItem value="pago">Pagas</ToggleGroupItem>
            <ToggleGroupItem value="all">Tudo</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" value={filterSector} onValueChange={(v) => v && setFilterSector(v as any)}>
            <ToggleGroupItem value="all">Todos</ToggleGroupItem>
            <ToggleGroupItem value="publico">Público</ToggleGroupItem>
            {access.canViewPrivado && <ToggleGroupItem value="privado">Privado</ToggleGroupItem>}
            <ToggleGroupItem value="geral">Geral</ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Contas a Pagar</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>}
              {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada.</TableCell></TableRow>}
              {filtered.map((p: any) => (
                <TableRow key={p.id} className={p.is_overdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                  <TableCell className="font-medium">
                    {p.description}
                    {p.is_recurring && <Badge variant="outline" className="ml-2 text-xs">↻ {p.recurrence_period}</Badge>}
                  </TableCell>
                  <TableCell>{p.vendor || '—'}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.cost_center}</Badge></TableCell>
                  <TableCell><Badge variant={p.sector === 'publico' ? 'default' : p.sector === 'privado' ? 'secondary' : 'outline'}>{p.sector}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{fmtBRL(Number(p.amount))}</TableCell>
                  <TableCell>
                    {p.due_date}
                    {p.status === 'aberto' && (
                      <Badge variant={p.is_overdue ? 'destructive' : p.days_until <= 7 ? 'default' : 'secondary'} className="ml-2 text-xs">
                        {p.is_overdue ? `${Math.abs(p.days_until)}d atraso` : `${p.days_until}d`}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'pago' ? 'default' : p.is_overdue ? 'destructive' : 'secondary'}>
                      {p.status === 'pago' ? '✓ Pago' : p.is_overdue ? 'Atrasado' : p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {p.status === 'aberto' && <Button size="sm" variant="ghost" title="Marcar paga" onClick={() => markPaid(p.id)}><CheckCircle className="h-4 w-4 text-emerald-600" /></Button>}
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDel(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Nova'} Conta a Pagar</DialogTitle>
            <DialogDescription>Cadastre fornecedores, recorrências e despesas pendentes</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Mensalidade contabilidade" />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Ex: Aldenizia" />
            </div>
            <div>
              <Label>Valor</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label>Vencimento</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.cost_center} onValueChange={(v) => setForm({ ...form, cost_center: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COST_CENTERS.map(cc => <SelectItem key={cc} value={cc}>{cc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor</Label>
              <Select value={form.sector} onValueChange={(v: any) => setForm({ ...form, sector: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Projeto vinculado (opcional)</Label>
              <Select value={form.project_id || 'none'} onValueChange={(v) => setForm({ ...form, project_id: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects.filter(p => !p.is_archived).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch checked={form.is_recurring} onCheckedChange={(v) => setForm({ ...form, is_recurring: v })} />
              <Label>Recorrente</Label>
              {form.is_recurring && (
                <Select value={form.recurrence_period} onValueChange={(v) => setForm({ ...form, recurrence_period: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="bimestral">Bimestral</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="col-span-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{form.id ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover conta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && del(confirmDel)}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContasPagar;
