

## Plano: Corrigir Projetos Não Identificados nas Receitas

### Problema Diagnosticado

As receitas na aba "Receitas" do Admin Financeiro estão aparecendo como **"N/A"** ou **"Não identificado"** porque:

1. O hook `useProjects()` só busca projetos **ativos** (`is_archived = false`)
2. Muitas receitas estão vinculadas a projetos **arquivados**
3. Quando o código tenta enriquecer as receitas com o nome do projeto, não encontra o projeto na lista

**Projetos arquivados afetados (13 projetos, R$ 611 mil em receitas):**

| Projeto | Receitas | Total |
|---------|----------|-------|
| FHEMIG-BH | 3 | R$ 404.172,91 |
| SPRF-AL | 5 | R$ 46.793,60 |
| FENIX-COWORKING | 2 | R$ 30.000,00 |
| SPF-RO | 4 | R$ 22.547,28 |
| ZOOTECNIA-USP | 2 | R$ 21.800,00 |
| UNESPAR - EST. METÁLICA | 1 | R$ 18.997,00 |
| IBC-RJ | 2 | R$ 18.498,92 |
| SANTA MARIA-RS | 1 | R$ 16.369,15 |
| CIAP-SP | 1 | R$ 12.298,77 |
| LORENA-SP | 2 | R$ 5.596,50 |
| THALES-GILVANDO&CARINE | 2 | R$ 5.500,00 |
| THALES-CLEBER&IGOR | 1 | R$ 4.500,00 |
| IRIS-REFORCO EST | 1 | R$ 4.000,00 |

### Solução Proposta

Criar um hook separado para buscar **todos os projetos** (incluindo arquivados) especificamente para uso em contextos financeiros, mantendo o comportamento atual do `useProjects()` para outras áreas do sistema.

### Mudanças Técnicas

#### 1. Novo Hook: `useAllProjects` em `src/hooks/useContractFinancials.ts`

```typescript
export function useAllProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetchAllProjects();
  }, []);

  return { projects, loading };
}
```

#### 2. Atualizar `AdminFinanceiro.tsx`

- Importar o novo hook `useAllProjects`
- Usar `allProjects` no cálculo de `enrichedIncome` para garantir que projetos arquivados também sejam encontrados
- Manter o uso de `projects` (apenas ativos) para formulários de criação/edição

```typescript
// Adicionar import
import { useAllProjects } from '@/hooks/useContractFinancials';

// No componente
const { projects: allProjects } = useAllProjects();

// No enrichedIncome
const enrichedIncome = useMemo(() => {
  return contractIncome.map(inc => {
    const project = allProjects.find(p => p.id === inc.project_id);
    return {
      ...inc,
      project_name: project?.name || 'Projeto não encontrado',
      sector: project?.type || 'privado'
    };
  });
}, [contractIncome, allProjects]);
```

#### 3. Indicador Visual para Projetos Arquivados (Opcional)

Adicionar um badge ou ícone para receitas de projetos arquivados:

```typescript
<Badge variant={project?.is_archived ? 'outline' : 'secondary'}>
  {income.project_name}
  {project?.is_archived && ' (Arquivado)'}
</Badge>
```

### Arquivos a Modificar

1. **src/hooks/useContractFinancials.ts** - Adicionar hook `useAllProjects()`
2. **src/pages/AdminFinanceiro.tsx** - Usar o novo hook no enriquecimento de receitas

### Resultado Esperado

- Todas as receitas mostrarão o nome correto do projeto, mesmo que arquivado
- Nenhuma receita aparecerá como "N/A" ou "Não identificado"
- Receitas de projetos arquivados serão identificadas visualmente
- O comportamento do resto do sistema permanece inalterado

