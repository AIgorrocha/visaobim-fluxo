

## Plano: Unificar Status e Corrigir Visualização de Projetos Arquivados

### Problema 1: Dois Status Para "Concluído"

**Situação atual:**
- No banco de dados existem dois status diferentes:
  - `CONCLUIDO` - usado em 7 projetos (6 privados + 1 público)
  - `FINALIZADO` - usado em 9 projetos públicos
- Tarefas usam apenas `CONCLUIDA` (com "A" no final, diferente de projetos)

**Decisão:** Unificar todos para `CONCLUIDO` pois:
1. É o mais usado em projetos privados
2. É consistente com o status de tarefas (`CONCLUIDA`)
3. Requer menos mudanças no código (maioria já usa CONCLUIDO)

---

### Problema 2: Projetos Arquivados Não Aparecem

**Causa raiz:**
- A página Projetos usa `useSupabaseData().projects` que só busca projetos com `is_archived = false`
- Quando você clica em "Ver Arquivados", o filtro `showArchived` muda para `true`
- MAS a lista de projetos continua sendo a mesma (só projetos ativos)
- O hook `useArchivedProjects()` existe no código mas NÃO está sendo usado

**Projeto "Reforma das Coberturas":**
- Está no banco como arquivado (`is_archived = true`)
- Status: `CONCLUIDO`, Tipo: `publico`
- Não aparece porque o hook só busca projetos ativos

---

### Solução Proposta

#### Parte 1: Migração SQL para Unificar Status

Atualizar todos os projetos com status `FINALIZADO` para `CONCLUIDO`:

```sql
-- Atualizar projetos com status FINALIZADO para CONCLUIDO
UPDATE projects 
SET status = 'CONCLUIDO' 
WHERE status = 'FINALIZADO';

-- Atualizar a constraint para remover FINALIZADO
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('EM_ANDAMENTO', 'EM_ESPERA', 'PARALISADO', 'CONCLUIDO', 'AGUARDANDO_PAGAMENTO', 'AGUARDANDO_APROVACAO'));
```

#### Parte 2: Modificar Página de Projetos

**Arquivo:** `src/pages/Projetos.tsx`

Usar o hook `useArchivedProjects()` quando o usuário clicar em "Ver Arquivados":

```typescript
import { useArchivedProjects } from '@/hooks/useSupabaseData';

const Projetos = () => {
  const { projects: activeProjects, updateProject, deleteProject, profiles } = useSupabaseData();
  const { projects: archivedProjects, updateProject: updateArchivedProject, refetch: refetchArchived } = useArchivedProjects();
  
  // Usar a lista correta baseada no estado
  const allProjects = isAdmin 
    ? (showArchived ? archivedProjects : activeProjects)
    : (showArchived ? archivedProjects : activeProjects).filter(project => 
        project.responsible_ids?.includes(user.id)
      );
```

#### Parte 3: Atualizar Código para Usar Apenas CONCLUIDO

**Arquivos a modificar:**

| Arquivo | Alteração |
|---------|-----------|
| `src/types/index.ts` | Remover `FINALIZADO` do tipo status |
| `src/pages/AdminFinanceiro.tsx` | Remover opção `FINALIZADO` do filtro |
| `src/pages/Projetos.tsx` | Remover `FINALIZADO` do statusConfig e filtros |
| `src/hooks/useContractFinancials.ts` | Atualizar contagem de contratos concluídos para incluir só `CONCLUIDO` |
| `src/hooks/useUserData.tsx` | Remover referência a `FINALIZADO` |
| `src/pages/Relatorios.tsx` | Já usa apenas `CONCLUIDO` |

#### Parte 4: Exportar useArchivedProjects no Contexto (Opcional)

Adicionar ao `SupabaseDataContext` para facilitar o uso em todo o sistema.

---

### Arquivos a Modificar

1. **Migração SQL** - Unificar FINALIZADO → CONCLUIDO no banco
2. **`src/pages/Projetos.tsx`** - Usar `useArchivedProjects` para projetos arquivados
3. **`src/types/index.ts`** - Remover `FINALIZADO` do tipo
4. **`src/pages/AdminFinanceiro.tsx`** - Remover `FINALIZADO` do filtro
5. **`src/hooks/useContractFinancials.ts`** - Simplificar lógica de contagem

---

### Resultado Esperado

1. **Status unificado:** Apenas `CONCLUIDO` em todo o sistema
2. **Projetos arquivados visíveis:** Ao clicar em "Ver Arquivados", verá os 13+ projetos arquivados
3. **"Reforma das Coberturas" visível:** Aparecerá na lista de projetos arquivados
4. **Consistência:** Mesmo status em projetos, tarefas e gestão financeira

