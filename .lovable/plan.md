

## Plano: Correção de Dois Problemas na Gestão Financeira e Projetos

### Problemas Identificados

---

#### **Problema 1: Contratos Públicos Concluídos Não Aparecem na Visão Geral**

**Diagnóstico:**
- No banco de dados existem **dois status diferentes** para projetos "concluídos":
  - `CONCLUIDO` (6 privados + 1 público)
  - `FINALIZADO` (9 públicos)
- O filtro de status na Visão Geral só tem a opção `CONCLUIDO`
- Isso exclui todos os 9 contratos públicos que têm status `FINALIZADO`

**Dados do banco:**
| Status | Tipo | Quantidade |
|--------|------|------------|
| CONCLUIDO | privado | 6 |
| CONCLUIDO | publico | 1 |
| FINALIZADO | publico | **9** (não aparecem!) |

---

#### **Problema 2: Status do Projeto "Reforma das Coberturas" Não Atualiza**

**Diagnóstico:**
- O projeto está **arquivado** (`is_archived = true`)
- O hook `useProjects()` só busca projetos com `is_archived = false`
- Quando você está na visualização de arquivados e tenta atualizar o status:
  1. A atualização **funciona no banco** (confirmei que o status está atualizado)
  2. Porém o estado local não é atualizado porque o projeto não está na lista carregada
  3. A UI não reflete a mudança até recarregar a página

**Adicionalmente:** Há erros de `invalid input syntax for type date: ""` nos logs que indicam que datas vazias estão sendo enviadas ao banco.

---

### Solução Proposta

#### 1. Adicionar status `FINALIZADO` ao filtro de Visão Geral

**Arquivo:** `src/pages/AdminFinanceiro.tsx`

Adicionar a opção `FINALIZADO` ao array de status disponíveis para filtro:

```typescript
{[
  { value: 'all', label: 'Todos' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguard. Pagamento' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguard. Aprovacao' },
  { value: 'PARALISADO', label: 'Paralisado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'FINALIZADO', label: 'Finalizado' }  // NOVO
]}
```

**Alternativa:** Unificar os status no banco para usar apenas `CONCLUIDO`. Esta seria uma migração de dados.

---

#### 2. Modificar `useProjects` para gerenciar projetos arquivados corretamente

**Arquivo:** `src/hooks/useSupabaseData.ts`

O hook `updateProject` precisa:
1. Atualizar o estado local mesmo para projetos arquivados
2. Manter o projeto na lista se estiver sendo visualizado na aba "Arquivados"

```typescript
const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Se o projeto atualizado está arquivado e não está na lista,
    // não adicionar (pois a lista só mostra ativos)
    // Mas se JÁ ESTÁ na lista, atualizar normalmente
    setProjects(prev => {
      const existsInList = prev.some(p => p.id === id);
      if (existsInList) {
        return prev.map(p => p.id === id ? data as Project : p);
      }
      return prev;
    });
    
    return data;
  } catch (err: any) {
    setError(err.message);
    throw err;
  }
};
```

---

#### 3. Criar hook separado para gerenciar projetos arquivados

**Arquivo:** `src/hooks/useSupabaseData.ts`

Criar `useArchivedProjects` que busca apenas projetos arquivados:

```typescript
export function useArchivedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', true)
      .order('created_at', { ascending: false });
    
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  // ... updateProject específico para arquivados

  useEffect(() => { fetchProjects(); }, []);
  return { projects, loading, updateProject, refetch: fetchProjects };
}
```

---

#### 4. Corrigir erro de data vazia no ProjectModal

**Arquivo:** `src/components/ProjectModal.tsx`

A função `formatDateForStorage` retorna string vazia quando não há data, mas o banco espera `null`:

```typescript
const formatDateForStorage = (dateString: string) => {
  if (!dateString) return null;  // Retornar null em vez de ''
  return dateString;
};

// No handleSubmit:
const projectData = {
  ...formData,
  contract_start: formData.contract_start || null,
  contract_end: formData.contract_end || null,
  prazo_vigencia: formData.prazo_vigencia || null
};
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/AdminFinanceiro.tsx` | Adicionar `FINALIZADO` ao filtro de status |
| `src/hooks/useSupabaseData.ts` | Corrigir `updateProject` para projetos arquivados e criar `useArchivedProjects` |
| `src/components/ProjectModal.tsx` | Retornar `null` em vez de `''` para datas vazias |
| `src/pages/Projetos.tsx` | Usar hook correto para projetos arquivados |

---

### Resultado Esperado

1. **Contratos públicos finalizados** aparecerão ao selecionar o filtro "Finalizado" ou "Todos"
2. **Atualizações de status** em projetos arquivados serão refletidas imediatamente na UI
3. **Erros de data** não ocorrerão mais ao salvar projetos sem datas preenchidas

