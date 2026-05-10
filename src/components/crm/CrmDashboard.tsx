import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle, Inbox, FileText, Briefcase, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCrmFollowups } from '@/hooks/useCrm';
import { CrmFollowup } from '@/types';

const ENTITY_LABEL = { lead: 'Lead', proposal: 'Proposta', project: 'Projeto' } as const;
const ENTITY_ICON = { lead: Inbox, proposal: FileText, project: Briefcase } as const;
const ENTITY_COLOR = { lead: 'bg-orange-500', proposal: 'bg-blue-500', project: 'bg-emerald-600' } as const;

export default function CrmDashboard() {
  const { followups, loading, refetch } = useCrmFollowups();

  const grouped = useMemo(() => {
    const overdue: CrmFollowup[] = [];
    const today: CrmFollowup[] = [];
    const next7: CrmFollowup[] = [];
    const later: CrmFollowup[] = [];
    followups.forEach(f => {
      if (f.days_until < 0) overdue.push(f);
      else if (f.days_until === 0) today.push(f);
      else if (f.days_until <= 7) next7.push(f);
      else later.push(f);
    });
    return { overdue, today, next7, later };
  }, [followups]);

  const formatDate = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');

  const renderItem = (f: CrmFollowup) => {
    const Icon = ENTITY_ICON[f.entity_type];
    return (
      <div key={`${f.entity_type}-${f.entity_id}`} className="flex items-center gap-3 p-3 bg-white border rounded hover:shadow-sm">
        <div className={`${ENTITY_COLOR[f.entity_type]} h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{ENTITY_LABEL[f.entity_type]}</Badge>
            <span className="font-medium text-sm truncate">{f.title}</span>
            {f.company && <Badge variant="secondary" className="text-xs">{f.company}</Badge>}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {f.contact_email && <span>{f.contact_email}</span>}
            {f.contact_phone && <span> · {f.contact_phone}</span>}
            <span> · status: {f.status}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-medium">{formatDate(f.due_date)}</div>
          <div className={`text-xs ${f.days_until < 0 ? 'text-red-600 font-bold' : f.days_until === 0 ? 'text-orange-600 font-bold' : 'text-muted-foreground'}`}>
            {f.days_until < 0 ? `${Math.abs(f.days_until)}d atraso` : f.days_until === 0 ? 'HOJE' : `em ${f.days_until}d`}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Follow-ups</h2>
          <p className="text-sm text-muted-foreground">Visão unificada: leads + propostas + projetos</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{grouped.overdue.length}</div>
                <div className="text-xs text-red-700">Atrasados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-700">{grouped.today.length}</div>
                <div className="text-xs text-orange-700">Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{grouped.next7.length}</div>
                <div className="text-xs text-blue-700">Próximos 7 dias</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{grouped.later.length}</div>
                <div className="text-xs text-muted-foreground">Mais tarde</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : (
        <div className="space-y-4">
          {grouped.overdue.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-red-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Atrasados ({grouped.overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">{grouped.overdue.map(renderItem)}</CardContent>
              </Card>
            </motion.div>
          )}

          {grouped.today.length > 0 && (
            <Card className="border-orange-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-orange-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Hoje ({grouped.today.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">{grouped.today.map(renderItem)}</CardContent>
            </Card>
          )}

          {grouped.next7.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Próximos 7 dias ({grouped.next7.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">{grouped.next7.map(renderItem)}</CardContent>
            </Card>
          )}

          {followups.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum follow-up pendente. Bom trabalho!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
