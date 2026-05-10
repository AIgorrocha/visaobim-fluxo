import { useState, useMemo } from 'react';
import { Briefcase, Calendar, AlertCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Project, Task } from '@/types';
import InteractionTimeline from './InteractionTimeline';

const HEALTH_CONFIG = {
  verde: { label: 'OK', color: 'bg-green-500' },
  amarelo: { label: 'Atenção', color: 'bg-yellow-500' },
  vermelho: { label: 'Crítico', color: 'bg-red-500' },
};

export default function CrmPosVenda() {
  const { projects, tasks, updateProject } = useSupabaseData();
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Project | null>(null);

  const activeProjects: Project[] = useMemo(() => {
    return (projects as Project[])
      .filter(p => !['CONCLUIDO', 'arquivado', 'cancelado'].includes(p.status as string))
      .filter(p => !p.is_archived)
      .filter(p => healthFilter === 'all' || p.crm_health === healthFilter)
      .filter(p => {
        const q = search.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const da = a.crm_next_contact ? new Date(a.crm_next_contact).getTime() : Infinity;
        const db = b.crm_next_contact ? new Date(b.crm_next_contact).getTime() : Infinity;
        return da - db;
      });
  }, [projects, search, healthFilter]);

  const tasksByProject = useMemo(() => {
    const map: Record<string, Task[]> = {};
    (tasks as Task[]).forEach(t => {
      if (!t.is_archived && t.status !== 'CONCLUIDA') {
        (map[t.project_id] ||= []).push(t);
      }
    });
    return map;
  }, [tasks]);

  const setHealth = async (project: Project, health: 'verde' | 'amarelo' | 'vermelho') => {
    try {
      await updateProject(project.id, { crm_health: health });
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const formatDate = (s?: string | null) => s ? new Date(s).toLocaleDateString('pt-BR') : '—';

  const daysUntil = (date?: string | null) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diff;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Pós-Venda — Clientes Ativos</h2>
        <p className="text-sm text-muted-foreground">Projetos contratados. Cobre projetistas, marque saúde, registre contatos.</p>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar projeto/cliente..." className="pl-10" />
          </div>
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda saúde</SelectItem>
              <SelectItem value="verde">🟢 OK</SelectItem>
              <SelectItem value="amarelo">🟡 Atenção</SelectItem>
              <SelectItem value="vermelho">🔴 Crítico</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {activeProjects.map(p => {
          const days = daysUntil(p.crm_next_contact);
          const overdue = days !== null && days < 0;
          const today = days === 0;
          const pendingTasks = tasksByProject[p.id] || [];
          const health = (p.crm_health || 'verde') as keyof typeof HEALTH_CONFIG;

          return (
            <Card key={p.id} className={`border-l-4 ${overdue ? 'border-l-red-500' : today ? 'border-l-orange-500' : `border-l-${HEALTH_CONFIG[health].color.replace('bg-', '')}`}`}
                  style={{ borderLeftColor: overdue ? '#ef4444' : today ? '#f97316' : health === 'verde' ? '#22c55e' : health === 'amarelo' ? '#eab308' : '#ef4444' }}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span className="truncate">{p.name}</span>
                    </CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">{p.client} · {p.type === 'publico' ? 'Público' : 'Privado'}</div>
                  </div>
                  <Select value={health} onValueChange={(v) => setHealth(p, v as any)}>
                    <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verde">🟢 OK</SelectItem>
                      <SelectItem value="amarelo">🟡 Atenção</SelectItem>
                      <SelectItem value="vermelho">🔴 Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" /> Próx. contato: {formatDate(p.crm_next_contact)}
                  </div>
                  {days !== null && (
                    <Badge variant={overdue ? 'destructive' : today ? 'default' : 'secondary'} className="text-xs">
                      {overdue ? `${Math.abs(days)}d atraso` : today ? 'HOJE' : `em ${days}d`}
                    </Badge>
                  )}
                </div>

                {pendingTasks.length > 0 && (
                  <div className="text-xs bg-amber-50 border border-amber-200 rounded p-2">
                    <div className="flex items-center gap-1 font-medium text-amber-800">
                      <AlertCircle className="h-3 w-3" /> {pendingTasks.length} entrega(s) pendente(s) projetista
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {pendingTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="text-amber-700 truncate">• {t.title} {t.due_date && `(${formatDate(t.due_date)})`}</div>
                      ))}
                      {pendingTasks.length > 3 && <div className="text-amber-700 italic">+{pendingTasks.length - 3} mais</div>}
                    </div>
                  </div>
                )}

                <Button size="sm" variant="outline" className="w-full" onClick={() => setSelected(p)}>
                  Ver histórico / registrar contato
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {activeProjects.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum projeto ativo encontrado.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && <InteractionTimeline entityType="project" entityId={selected.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
