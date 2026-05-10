import { useState } from 'react';
import { Phone, MessageSquare, Mail, Users, FileText, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrmInteractions } from '@/hooks/useCrm';
import { CrmEntityType, InteractionType } from '@/types';

const TYPE_CONFIG: Record<InteractionType, { label: string; icon: any; color: string }> = {
  call: { label: 'Ligação', icon: Phone, color: 'bg-blue-500' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
  email: { label: 'Email', icon: Mail, color: 'bg-purple-500' },
  meeting: { label: 'Reunião', icon: Users, color: 'bg-orange-500' },
  note: { label: 'Nota', icon: FileText, color: 'bg-slate-500' },
};

interface Props {
  entityType: CrmEntityType;
  entityId: string;
  compact?: boolean;
}

export default function InteractionTimeline({ entityType, entityId, compact = false }: Props) {
  const { interactions, loading, createInteraction, deleteInteraction } = useCrmInteractions(entityType, entityId);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<InteractionType>('call');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [outcome, setOutcome] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextNotes, setNextNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!notes.trim()) {
      alert('Adicione uma nota');
      return;
    }
    setSaving(true);
    try {
      await createInteraction({
        entity_type: entityType,
        entity_id: entityId,
        interaction_type: type,
        occurred_at: new Date().toISOString(),
        notes,
        duration_minutes: duration ? Number(duration) : null,
        outcome: outcome || null,
        next_action_date: nextDate || null,
        next_action_notes: nextNotes || null,
      });
      setNotes(''); setDuration(''); setOutcome(''); setNextDate(''); setNextNotes('');
      setShowForm(false);
    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (s: string) => new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const formatDay = (s: string) => new Date(s).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Histórico de contatos {interactions.length > 0 && <span className="text-muted-foreground">({interactions.length})</span>}</h4>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" /> Registrar
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as InteractionType)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_CONFIG) as InteractionType[]).map(k => (
                      <SelectItem key={k} value={k}>{TYPE_CONFIG[k].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Duração (min)</Label>
                <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs">O que conversou? *</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Resumo da conversa..." />
            </div>
            <div>
              <Label className="text-xs">Resultado</Label>
              <Input value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="Ex: cliente vai analisar" className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-yellow-50 rounded">
              <div>
                <Label className="text-xs">📅 Próximo follow-up</Label>
                <Input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">O que fazer?</Label>
                <Input value={nextNotes} onChange={e => setNextNotes(e.target.value)} placeholder="Ex: enviar proposta" className="h-9" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : interactions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nenhum contato registrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {interactions.slice(0, compact ? 3 : undefined).map(i => {
            const cfg = TYPE_CONFIG[i.interaction_type];
            const Icon = cfg.icon;
            return (
              <div key={i.id} className="flex gap-3 p-3 bg-white border rounded-lg hover:shadow-sm">
                <div className={`${cfg.color} h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{cfg.label}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(i.occurred_at)}</span>
                    {i.duration_minutes && <span className="text-xs text-muted-foreground">{i.duration_minutes}min</span>}
                  </div>
                  {i.notes && <p className="text-sm mt-1">{i.notes}</p>}
                  {i.outcome && <p className="text-xs text-muted-foreground mt-1">→ {i.outcome}</p>}
                  {i.next_action_date && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-yellow-700" />
                      <span className="font-medium text-yellow-900">Próximo: {formatDay(i.next_action_date)}</span>
                      {i.next_action_notes && <span className="text-yellow-800">— {i.next_action_notes}</span>}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { if (confirm('Excluir registro?')) deleteInteraction(i.id); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          {compact && interactions.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">+{interactions.length - 3} contatos anteriores</p>
          )}
        </div>
      )}
    </div>
  );
}
