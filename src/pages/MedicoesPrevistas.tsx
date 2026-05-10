import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Pencil, Trash2, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAllProjects, useContractIncome } from '@/hooks/useContractFinancials';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ADMIN_FINANCIAL_EMAILS = ['igor@visaobim.com', 'stael@visaobim.com'];

const STAGES_PUBLICO = [
  { value: 'aguardando_orgao', label: 'Aguardando aprovação órgão' },
  { value: 'medicao_emitida', label: 'Medição emitida' },
  { value: 'aguardando_empenho', label: 'Aguardando empenho' },
  { value: 'nf_emitida', label: 'NF emitida' },
  { value: 'em_pagamento', label: 'Em pagamento' }
];
const STAGES_PRIVADO = [
  { value: 'aguardando_cliente', label: 'Aguardando aprovação cliente' },
  { value: 'aguardando_assinatura', label: 'Aguardando assinatura' },
  { value: 'nf_emitida', label: 'NF emitida' },
  { value: 'em_pagamento', label: 'Em pagamento' }
];

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface MedicaoForm {
  id?: string;
  project_id: string;
  amount: string;
  expected_date: string;
  description: string;
  income_type: 'medicao' | 'parcela' | 'entrada' | 'outro';
  approval_stage: string;
  blocker: string;
}

const emptyForm: MedicaoForm = {
  project_id: '',
  amount: '',
  expected_date: '',
  description: '',
  income_type: 'medicao',
  approval_stage: '',
  blocker: ''
};

const MedicoesPrevistas = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { projects } = useAllProjects();
  const { income, refetch } = useContractIncome();

  const [filterType, setFilterType] = useState<'all' | 'publico' | 'privado'>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [confirmReceive, setConfirmReceive] = useState<string | null>(null);
  const [form, setForm] = useState<MedicaoForm>(emptyForm);

  const isFinAdmin = ADMIN_FINANCIAL_EMAILS.includes(profile?.email?.toLowerCase() || '');

  const projectMap = useMemo(() => {
    const m = new Map<string, typeof projects[0]>();
    projects.forEach(p => m.set(p.id, p));
    return m;
  }, [projects]);

  const previstas = useMemo(() => {
    return income
      .filter((i: any) => i.status === 'previsto')
      .map((i: any) => {
        const proj = projectMap.get(i.project_id);
        const today = new Date();
        const exp = i.expected_date ? new Date(i.expected_date) : null;
        const days = exp ? Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
        return {
          ...i,
          project_name: proj?.name || 'Sem projeto',
          project_type: proj?.type as 'publico' | 'privado' | undefined,
          days_until: days
        };
      })
      .filter(m => filterType === 'all' || m.project_type === filterType)
      .filter(m => filterStage === 'all' || m.approval_stage === filterStage)
      .sort((a, b) => {
        if (a.expected_date && b.expected_date) return a.expected_date.localeCompare(b.expected_date);
        if (a.expected_date) return -1;
        if (b.expected_date) return 1;
        return 0;
      });
  }, [income, projectMap, filterType, filterStage]);

  const totalPub = previstas.filter(m => m.project_type === 'publico').reduce((s, m) => s + Number(m.amount), 0);
  const totalPvt = previstas.filter(m => m.project_type === 'privado').reduce((s, m) => s + Number(m.amount), 0);
  const proximos30 = previstas.filter(m => m.days_until !== null && m.days_until >= 0 && m.days_until <= 30).reduce((s, m) => s + Number(m.amount), 0);
  const atrasadas = previstas.filter(m => m.days_until !== null && m.days_until < 0).reduce((s, m) => s + Number(m.amount), 0);

  if (!isFinAdmin) {
    return <div className="p-6"><Card><CardContent className="pt-6 text-center text-muted-foreground">Acesso restrito.</CardContent></Card></div>;
  }

  const openNew = () => { setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (m: any) => {
    setForm({
      id: m.id,
      project_id: m.project_id,
      amount: String(m.amount),
      expected_date: m.expected_date || '',
      description: m.description || '',
      income_type: m.income_type || 'medicao',
      approval_stage: m.approval_stage || '',
      blocker: m.blocker || ''
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.project_id || !form.amount) {
      toast({ title: 'Preencha projeto e valor', variant: 'destructive' });
      return;
    }
    const payload: any = {
      project_id: form.project_id,
      amount: Number(form.amount),
      expected_date: form.expected_date || null,
      description: form.description,
      income_type: form.income_type,
      income_date: form.expected_date || new Date().toISOString().slice(0, 10),
      status: 'previsto',
      approval_stage: form.approval_stage || null,
      blocker: form.blocker || null
    };
    const { error } = form.id
      ? await (supabase.from('contract_income') as any).update(payload).eq('id', form.id)
      : await (supabase.from('contract_income') as any).insert([payload]);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: form.id ? 'Medição atualizada' : 'Medição cadastrada' });
    setDialogOpen(false);
    setForm(emptyForm);
    refetch();
  };

  const del = async (id: string) => {
    const { error } = await (supabase.from('contract_income') as any).delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Medição removida' }); refetch(); }
    setConfirmDel(null);
  };

  const markReceived = async (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await (supabase.from('contract_income') as any)
      .update({ status: 'recebido', income_date: today, blocker: null })
      .eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Marcada como recebida' }); refetch(); }
    setConfirmReceive(null);
  };

  const projectsActive = projects.filter(p => p.project_value && p.project_value > 0 && p.status !== 'EM_ESPERA');
  const stageOptions = form.project_id && projectMap.get(form.project_id)?.type === 'privado' ? STAGES_PRIVADO : STAGES_PUBLICO;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-7 w-7" /> Medições Previstas</h1>
          <p className="text-muted-foreground">Cadastro e acompanhamento do dinheiro próximo de entrar</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nova Medição Prevista</Button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total Público</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{fmtBRL(totalPub)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Privado</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600">{fmtBRL(totalPvt)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Próximos 30 dias</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-indigo-600">{fmtBRL(proximos30)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Atrasadas</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{fmtBRL(atrasadas)}</div></CardContent></Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <ToggleGroup type="single" value={filterType} onValueChange={(v) => v && setFilterType(v as any)}>
              <ToggleGroupItem value="all">Tudo</ToggleGroupItem>
              <ToggleGroupItem value="publico">Público</ToggleGroupItem>
              <ToggleGroupItem value="privado">Privado</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Estágio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estágios</SelectItem>
              {[...STAGES_PUBLICO, ...STAGES_PRIVADO].map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader><CardTitle>Lista de Medições Previstas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Previsto</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Bloqueio</TableHead>
                <TableHead className="text-right">Dias</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previstas.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Nenhuma medição prevista. Clique em "Nova Medição Prevista" para cadastrar.
                </TableCell></TableRow>
              )}
              {previstas.map((m: any) => {
                const stageLabel = [...STAGES_PUBLICO, ...STAGES_PRIVADO].find(s => s.value === m.approval_stage)?.label || m.approval_stage;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.project_name}</TableCell>
                    <TableCell><Badge variant={m.project_type === 'publico' ? 'default' : 'secondary'}>{m.project_type || '—'}</Badge></TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{m.description}</TableCell>
                    <TableCell className="text-right font-semibold">{fmtBRL(Number(m.amount))}</TableCell>
                    <TableCell>{m.expected_date || '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{stageLabel || '—'}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={m.blocker || ''}>{m.blocker || '—'}</TableCell>
                    <TableCell className="text-right">
                      {m.days_until !== null ? (
                        <Badge variant={m.days_until < 0 ? 'destructive' : m.days_until <= 30 ? 'default' : 'secondary'}>
                          {m.days_until < 0 ? `${Math.abs(m.days_until)}d atrasado` : `${m.days_until}d`}
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" title="Marcar como recebida" onClick={() => setConfirmReceive(m.id)}><CheckCircle className="h-4 w-4 text-emerald-600" /></Button>
                        <Button size="sm" variant="ghost" title="Editar" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" title="Remover" onClick={() => setConfirmDel(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Nova'} Medição Prevista</DialogTitle>
            <DialogDescription>Cadastre o que está previsto a entrar e o que falta para sair</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Contrato</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                <SelectContent>
                  {projectsActive.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">[{p.type}]</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
            </div>
            <div>
              <Label>Data Prevista</Label>
              <Input type="date" value={form.expected_date} onChange={(e) => setForm({ ...form, expected_date: e.target.value })} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.income_type} onValueChange={(v: any) => setForm({ ...form, income_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicao">Medição</SelectItem>
                  <SelectItem value="parcela">Parcela</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estágio de Aprovação</Label>
              <Select value={form.approval_stage} onValueChange={(v) => setForm({ ...form, approval_stage: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {stageOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: 3ª Medição FHEMIG" />
            </div>
            <div className="col-span-2">
              <Label>O que falta para sair? (Bloqueio)</Label>
              <Textarea value={form.blocker} onChange={(e) => setForm({ ...form, blocker: e.target.value })} placeholder="Ex: Aguardando assinatura do contratante / Aguardando aprovação prefeitura" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{form.id ? 'Salvar' : 'Cadastrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirma deleção */}
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover medição prevista?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && del(confirmDel)}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirma marcar recebido */}
      <AlertDialog open={!!confirmReceive} onOpenChange={(o) => !o && setConfirmReceive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como recebida?</AlertDialogTitle>
            <AlertDialogDescription>O lançamento sai de "previsto" e vira receita realizada com data de hoje.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmReceive && markReceived(confirmReceive)}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicoesPrevistas;
