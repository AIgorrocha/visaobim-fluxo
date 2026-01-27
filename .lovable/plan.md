
## Plano: Incluir Contratos Concluídos/Arquivados na Visão Geral Financeira

### Problema Diagnosticado

Os contratos concluídos/arquivados não aparecem na **aba "Visão Geral"** do Admin Financeiro porque:

1. O hook `useContractOverview()` usa `useSupabaseData().projects`, que filtra por `is_archived = false`
2. Isso exclui automaticamente todos os projetos arquivados, incluindo a maioria dos **CONCLUÍDOS**

**Projetos arquivados não visíveis (13+ projetos, R$ 631k em valor):**

| Projeto | Valor Contrato | Status |
|---------|----------------|--------|
| FHEMIG-BH | R$ 404.172,91 | FINALIZADO |
| SPRF-AL | R$ 52.479,04 | FINALIZADO |
| FENIX-COWORKING | R$ 30.000,00 | CONCLUIDO |
| LORENA-SP | R$ 28.500,00 | FINALIZADO |
| ZOOTECNIA-USP | R$ 18.800,00 | FINALIZADO |
| UNESPAR - EST. METÁLICA | R$ 18.997,00 | FINALIZADO |
| IBC-RJ | R$ 18.498,92 | FINALIZADO |
| SPF-RO | R$ 17.107,04 | FINALIZADO |
| SANTA MARIA-RS | R$ 16.470,58 | FINALIZADO |
| CIAP-SP | R$ 12.298,77 | FINALIZADO |
| THALES-GILVANDO&CARINE | R$ 5.500,00 | AGUARD. PAG. |
| THALES-CLEBER&IGOR | R$ 4.500,00 | CONCLUIDO |
| IRIS-REFORCO EST | R$ 4.000,00 | CONCLUIDO |

### Solução Proposta

Modificar o hook `useContractOverview()` para usar `useAllProjects()` (que já existe no mesmo arquivo) em vez de `useSupabaseData().projects`. Isso garantirá que **todos os projetos** (ativos e arquivados) sejam incluídos na análise financeira.

### Mudanças Técnicas

#### 1. Modificar `useContractOverview()` em `src/hooks/useContractFinancials.ts`

**Antes:**
```typescript
export function useContractOverview() {
  const { projects, payments, pricing } = useSupabaseData();
  // ...
  return projects
    .filter(p => !p.is_archived && p.project_value && ...)
```

**Depois:**
```typescript
export function useContractOverview() {
  const { payments, pricing } = useSupabaseData();
  const { projects: allProjects, loading: projectsLoading } = useAllProjects();
  // ...
  return allProjects
    .filter(p => p.project_value && p.project_value > 0 && p.status !== 'EM_ESPERA')
    // Remover filtro !p.is_archived para incluir arquivados
```

#### 2. Adicionar indicador de "Arquivado" no ContractOverview

Modificar a interface `ContractOverview` para incluir:

```typescript
export interface ContractOverview {
  // ... campos existentes ...
  is_archived?: boolean; // Novo campo
}
```

E no mapeamento:
```typescript
return {
  // ... campos existentes ...
  is_archived: project.is_archived || false
};
```

#### 3. Atualizar a UI para indicar contratos arquivados

Na tabela de contratos (AdminFinanceiro.tsx), adicionar um indicador visual:

```tsx
<Badge variant={contract.is_archived ? 'outline' : 'secondary'}>
  {contract.project_name}
  {contract.is_archived && ' 📦'}
</Badge>
```

### Arquivos a Modificar

1. **src/hooks/useContractFinancials.ts**
   - Modificar `useContractOverview()` para usar `useAllProjects()`
   - Atualizar interface `ContractOverview` com campo `is_archived`
   - Remover filtro `!p.is_archived` no useMemo

2. **src/pages/AdminFinanceiro.tsx**
   - Adicionar indicador visual para contratos arquivados nas tabelas
   - Adicionar filtro opcional para mostrar/ocultar arquivados (se desejado)

### Resultado Esperado

- **Todos os contratos** (ativos e arquivados) aparecerão na Visão Geral
- Contratos CONCLUÍDOS/FINALIZADOS serão visíveis ao selecionar o filtro de status correspondente
- Receitas e despesas de projetos arquivados serão contabilizadas corretamente
- Contratos arquivados terão indicador visual para diferenciá-los
- Os cards de resumo mostrarão valores totais incluindo projetos concluídos
