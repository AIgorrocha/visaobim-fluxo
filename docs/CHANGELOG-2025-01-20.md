# Changelog - 20 de Janeiro de 2025

Documentação completa de todas as alterações realizadas no sistema VisãoBIM Fluxo.

---

## Resumo do Dia

| Métrica | Quantidade |
|---------|------------|
| **Total de Commits** | 18 |
| **Arquivos Criados** | 2 |
| **Arquivos Modificados** | ~15 |
| **Tabelas Supabase Criadas** | 1 |
| **Projetos Criados** | 7 |
| **Projetos Atualizados** | 17 |
| **Recebimentos Cadastrados** | 17 |

---

## Lista Completa de Commits (18 commits)

| # | Commit | Tipo | Descrição |
|---|--------|------|-----------|
| 1 | `4dc5882` | feat | Adicionar matching por similaridade no financeiro |
| 2 | `109c0bd` | fix | Adicionar aliases para ARQUITETURA - BESSA e LEONARDO |
| 3 | `72cd1ca` | fix | Remover coluna Status da tabela de Precificacao |
| 4 | `b3bb642` | feat | Adicionar campo de majoracao na precificacao |
| 5 | `4749b12` | fix | Melhorar campo de porcentagem na precificacao |
| 6 | `b47826d` | feat | Adicionar filtro de tipo (privado/publico) na precificacao |
| 7 | `555f0d5` | feat | Atualizar nomes de projetos e adicionar aliases |
| 8 | `ac6b5c5` | feat | Adicionar filtro por projeto no historico de pagamentos |
| 9 | `a550f3c` | fix | Calcular valores a receber por PROJETISTA + PROJETO (ignorando disciplina) |
| 10 | `f187e89` | feat | Renomear EEEFM ANTONIO CARNEIRO para TALISMA-ESCOLA |
| 11 | `c8090e7` | fix | Filtrar projetistas inativos do sistema |
| 12 | `78839d9` | fix | Corrigir matching de projetos para evitar associacoes erradas |
| 13 | `4ff8dc2` | fix | Usar amount_paid do banco em vez de calcular dinamicamente |
| 14 | `475fdc0` | feat | Adicionar aba Precificacoes Nao Atribuidas no Admin Financeiro |
| 15 | `4e1a3bd` | feat | Adicionar sincronização em tempo real para dados financeiros |
| 16 | `48af59d` | feat | Dashboard financeiro com visão geral de contratos |
| 17 | `cbb183f` | fix | Remover coluna Margem da Visão Geral |
| 18 | `109b10e` | docs | Documentação completa das alterações de 20/01/2025 |

---

## Detalhamento dos Commits

### 1. `4dc5882` - feat: Adicionar matching por similaridade no financeiro

**Arquivo criado:** `src/utils/financialMatching.ts`

**Funcionalidades:**
- Sistema de matching por similaridade para projetos e disciplinas
- Mapeamento de aliases (siglas → nomes completos)
- Funções: `normalizeString()`, `calculateSimilarity()`, `areProjectsEquivalent()`, `areDisciplinesEquivalent()`

**Aliases de Projetos configurados:**
- DRF-PV → RECEITA FEDERAL, DRF, DRV, etc.
- CASA DA MULHER BRASILEIRA → CMB
- LACEN → FES, LACEN-FES
- LOTE 02 - TRE-AC → TRE-AC, TRE, etc.
- ESTUDO CENTRAL CELESC → CELESC-ESTUDO, etc.
- CELESC_TUBARAO → CELESC-RS, TUBARAO
- TALISMA-ESCOLA → ANTONIO CARNEIRO, EEEFM
- CAMPUS CURITIBA → UNESPAR-ELE

**Aliases de Disciplinas configurados:**
- SUPERESTRUTURAS → ESTRUTURAL, ESTRUTURAS
- FUNDACOES → FUNDACAO, FUND
- ELE E LOGICA → ELETRICO, ELETRICA
- HID → HIDRAULICA, HIDRO
- ARQUITETURA → ARQ, ARQUITETURA - BESSA, ARQUITETURA - LEONARDO

---

### 2. `109c0bd` - fix: Adicionar aliases para ARQUITETURA - BESSA e LEONARDO

**Arquivo modificado:** `src/utils/financialMatching.ts`

**Mudança:** Adicionado aliases para distinguir arquitetos:
- ARQUITETURA - BESSA
- ARQUITETURA - LEONARDO

---

### 3. `72cd1ca` - fix: Remover coluna Status da tabela de Precificacao

**Arquivo modificado:** `src/pages/Precificacao.tsx`

**Mudança:** Removida coluna "Status" que não estava sendo usada corretamente.

---

### 4. `b3bb642` - feat: Adicionar campo de majoracao na precificacao

**Arquivo modificado:** `src/pages/Precificacao.tsx`

**Funcionalidade:** Campo para aplicar majoração percentual nos valores de precificação.

---

### 5. `4749b12` - fix: Melhorar campo de porcentagem na precificacao

**Arquivo modificado:** `src/pages/Precificacao.tsx`

**Mudança:** Melhorias no input de porcentagem para evitar erros de entrada.

---

### 6. `b47826d` - feat: Adicionar filtro de tipo (privado/publico) na precificacao

**Arquivo modificado:** `src/pages/Precificacao.tsx`

**Funcionalidade:** Filtro para separar projetos privados e públicos na tela de precificação.

---

### 7. `555f0d5` - feat: Atualizar nomes de projetos e adicionar aliases

**Arquivos modificados:**
- `src/utils/financialMatching.ts`

**Mudança:** Adicionados mais aliases para matching de projetos.

---

### 8. `ac6b5c5` - feat: Adicionar filtro por projeto no historico de pagamentos

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`

**Funcionalidade:** Novo filtro dropdown para filtrar pagamentos por projeto específico.

---

### 9. `a550f3c` - fix: Calcular valores a receber por PROJETISTA + PROJETO

**Arquivos modificados:**
- `src/utils/financialMatching.ts`
- `src/pages/MeuFinanceiro.tsx`

**Mudança importante:**
- Antes: Matching era feito por projeto + disciplina
- Agora: Matching ignora disciplina, considera apenas projetista + projeto
- Motivo: Um projetista pode ter várias disciplinas no mesmo projeto, mas o pagamento é por projeto

---

### 10. `f187e89` - feat: Renomear EEEFM ANTONIO CARNEIRO para TALISMA-ESCOLA

**Alterações no Supabase:**
```sql
UPDATE projects SET name = 'TALISMA-ESCOLA' WHERE name = 'EEEFM ANTONIO CARNEIRO';
UPDATE designer_payments SET project_name = 'TALISMA-ESCOLA' WHERE project_name LIKE '%ANTONIO CARNEIRO%';
```

**Arquivo modificado:** `src/utils/financialMatching.ts` - Adicionado alias

---

### 11. `c8090e7` - fix: Filtrar projetistas inativos do sistema

**Arquivos modificados:**
- `src/pages/AdminFinanceiro.tsx`
- `src/pages/Precificacao.tsx`

**Mudança:** Filtrar usuários inativos (sem email ou desativados) das listas de seleção.

---

### 12. `78839d9` - fix: Corrigir matching de projetos para evitar associacoes erradas

**Arquivo modificado:** `src/utils/financialMatching.ts`

**Mudança:**
- Adicionada verificação de tamanho mínimo (5 caracteres) para matches por "contém"
- Evita matches errados como "DRF" matchando com "ANDRE"

---

### 13. `4ff8dc2` - fix: Usar amount_paid do banco em vez de calcular dinamicamente

**Arquivo modificado:** `src/hooks/useDesignerFinancials.ts`

**Mudança:**
- Antes: Calculava amount_paid somando pagamentos em tempo real
- Agora: Usa o campo `amount_paid` já salvo na tabela `project_pricing`

---

### 14. `475fdc0` - feat: Adicionar aba Precificacoes Nao Atribuidas no Admin Financeiro

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`

**Funcionalidade:**
- Nova aba "Não Atribuídas" no Admin Financeiro
- Lista precificações que não têm projetista designado
- Permite atribuir projetista diretamente da tabela
- Badge com contador de itens pendentes

---

### 15. `4e1a3bd` - feat: Adicionar sincronização em tempo real para dados financeiros

**Arquivos modificados:**
- `src/hooks/useRealtimeSync.ts`
- `src/contexts/SupabaseDataContext.tsx`
- `src/pages/MeuFinanceiro.tsx`

**Funcionalidades:**
- Real-time sync para tabelas: `designer_payments`, `project_pricing`, `disciplines`
- Hooks financeiros adicionados ao contexto global
- Removido "(40%)" do header "Sua Parte" em MeuFinanceiro

**Código adicionado em useRealtimeSync.ts:**
```typescript
.on('postgres_changes', { event: '*', schema: 'public', table: 'designer_payments' }, ...)
.on('postgres_changes', { event: '*', schema: 'public', table: 'project_pricing' }, ...)
.on('postgres_changes', { event: '*', schema: 'public', table: 'disciplines' }, ...)
```

---

### 16. `48af59d` - feat: Dashboard financeiro com visão geral de contratos

**Arquivos modificados:**
- `src/types/index.ts` - Removido FINALIZADO do tipo status
- `src/pages/Projetos.tsx` - Removido FINALIZADO dos filtros
- `src/components/ProjectModal.tsx` - Removido FINALIZADO do select
- `src/hooks/useUserData.tsx` - Removido FINALIZADO do filtro
- `src/pages/AdminFinanceiro.tsx` - Nova aba "Visão Geral"

**Arquivo criado:** `src/hooks/useContractFinancials.ts`

**Funcionalidades:**
- Status FINALIZADO removido completamente (usar apenas CONCLUIDO)
- Nova aba "Visão Geral" com:
  - Cards de resumo (Total Contratos, Recebido, A Receber, A Pagar Projetistas)
  - Tabela de Contratos Públicos com totais
  - Tabela de Contratos Privados com totais

---

### 17. `cbb183f` - fix: Remover coluna Margem da Visão Geral

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`

**Mudanças:**
- Removido card "Margem Bruta"
- Removido coluna "Margem" das tabelas
- Motivo: Custos completos ainda não estão sendo lançados

---

### 18. `109b10e` - docs: Documentação completa das alterações de 20/01/2025

**Arquivo criado:** `docs/CHANGELOG-2025-01-20.md` (versão inicial)

---

## Alterações no Supabase

### 1. Projetos Atualizados de FINALIZADO para CONCLUIDO

```sql
UPDATE projects SET status = 'CONCLUIDO' WHERE status = 'FINALIZADO';
```

| Projeto | Status Anterior | Status Novo |
|---------|-----------------|-------------|
| DELEGACIA POLICIA FEDERAL | FINALIZADO | CONCLUIDO |
| SHOPPING INDEPENDENCIA | FINALIZADO | CONCLUIDO |

---

### 2. Projeto Renomeado

```sql
UPDATE projects SET name = 'TALISMA-ESCOLA' WHERE name = 'EEEFM ANTONIO CARNEIRO';
UPDATE designer_payments SET project_name = 'TALISMA-ESCOLA' WHERE project_name LIKE '%ANTONIO CARNEIRO%';
```

---

### 3. Nova Tabela: `contract_income`

**Migration:** `create_contract_income_table`

```sql
CREATE TABLE contract_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  income_date DATE NOT NULL,
  description TEXT,
  income_type TEXT DEFAULT 'medicao' CHECK (income_type IN ('medicao', 'entrada', 'parcela', 'outro')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_income_project ON contract_income(project_id);
CREATE INDEX idx_contract_income_date ON contract_income(income_date);
ALTER TABLE contract_income ENABLE ROW LEVEL SECURITY;
```

---

### 4. Valores de Contrato Atualizados

#### Contratos Públicos
| Projeto | Valor Contrato |
|---------|----------------|
| DRF-PV | R$ 113.096,44 |
| CAMPUS CURITIBA | R$ 22.397,76 |
| LOTE 02 - TRE-AC | R$ 41.539,57 |
| GINASIOS | R$ 242.431,87 |
| CELESC_TUBARAO | R$ 99.208,84 |
| ESTUDO CENTRAL CELESC | R$ 86.698,72 |
| HTR | R$ 24.899,60 |

#### Contratos Privados
| Projeto | Valor Contrato |
|---------|----------------|
| TALISMA-ESCOLA | R$ 139.950,00 |
| ACADEMIA | R$ 20.500,00 |
| ROSANETE E ESEQUIAS | R$ 5.500,00 |
| ORÇAMENTO | R$ 7.000,00 |
| LAIS E SAROM | R$ 5.000,00 |
| INCÊNDIO | R$ 14.000,00 |
| CASA PABLO | R$ 28.000,00 |
| PORTAL DA ALEGRIA | R$ 85.500,00 |

---

### 5. Novos Projetos Criados

| Nome | Tipo | Valor | Status |
|------|------|-------|--------|
| SOP-REFORÇO | publico | R$ 15.434,36 | EM_ANDAMENTO |
| LACEN | publico | R$ 27.081,33 | EM_ANDAMENTO |
| BRENO-CASA | privado | R$ 25.800,00 | EM_ANDAMENTO |
| IRIS-REFORCO EST | privado | R$ 4.000,00 | CONCLUIDO |
| FENIX-COWORKING | privado | R$ 30.000,00 | EM_ANDAMENTO |
| THALES-GILVANDO&CARINE | privado | R$ 5.500,00 | EM_ANDAMENTO |
| THALES-CLEBER&IGOR | privado | R$ 4.500,00 | CONCLUIDO |

---

### 6. Recebimentos Cadastrados (contract_income)

#### Medições Públicas
| Data | Projeto | Valor | Tipo |
|------|---------|-------|------|
| 24/06/2025 | CAMPUS CURITIBA | R$ 16.152,30 | medicao |
| 01/09/2025 | DRF-PV | R$ 29.812,14 | medicao |
| 21/10/2025 | CELESC_TUBARAO | R$ 12.672,75 | medicao |
| 01/12/2025 | LOTE 02 - TRE-AC | R$ 35.308,63 | medicao |

#### Recebimentos Privados
| Projeto | Valor | Tipo |
|---------|-------|------|
| BRENO-CASA | R$ 23.300,00 | parcela |
| IRIS-REFORCO EST | R$ 4.000,00 | parcela |
| TALISMA-ESCOLA | R$ 42.871,95 | parcela |
| FENIX-COWORKING | R$ 16.000,00 | parcela |
| ACADEMIA | R$ 6.800,00 | parcela |
| ROSANETE E ESEQUIAS | R$ 2.750,00 | entrada |
| THALES-GILVANDO&CARINE | R$ 2.750,00 | entrada |
| THALES-CLEBER&IGOR | R$ 4.500,00 | parcela |
| ORÇAMENTO | R$ 2.500,00 | parcela |
| LAIS E SAROM | R$ 2.500,00 | entrada |
| INCÊNDIO | R$ 8.000,00 | parcela |
| CASA PABLO | R$ 14.000,00 | entrada |
| PORTAL DA ALEGRIA | R$ 19.000,00 | parcela |

**Total: 17 recebimentos cadastrados**

---

## Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/utils/financialMatching.ts` | Sistema de matching por similaridade |
| `src/hooks/useContractFinancials.ts` | Hook para dados de contratos |
| `docs/CHANGELOG-2025-01-20.md` | Esta documentação |

---

## Totais Consolidados

### Contratos Públicos
| Métrica | Valor |
|---------|-------|
| Total de Contratos | R$ 672.788,49 |
| Total Recebido | R$ 93.945,82 |
| Total a Receber | R$ 578.842,67 |

### Contratos Privados
| Métrica | Valor |
|---------|-------|
| Total de Contratos | R$ 375.050,00 |
| Total Recebido | R$ 148.971,95 |
| Total a Receber | R$ 226.078,05 |

### Geral
| Métrica | Valor |
|---------|-------|
| **Total Geral Contratos** | **R$ 1.047.838,49** |
| **Total Geral Recebido** | **R$ 242.917,77** |
| **Total Geral a Receber** | **R$ 804.920,72** |

---

## Observações Importantes

1. **Status FINALIZADO** - Removido completamente do sistema. Usar apenas CONCLUIDO.

2. **Matching de Pagamentos** - Agora considera apenas PROJETISTA + PROJETO, ignorando disciplina.

3. **Coluna Margem** - Removida temporariamente (custos não estão sendo lançados ainda).

4. **Real-time Sync** - Tabelas financeiras agora sincronizam em tempo real.

5. **BRENO-CASA** - Falta pagar R$ 1.300 ao Rondinelly (climatização).

6. **Projetistas Inativos** - Filtrados das listas de seleção.

---

## Próximos Passos

- [ ] Lançar custos dos projetos
- [ ] Adicionar coluna "Margem" após lançar custos
- [ ] Integração AppSheet/Google Sheets (futuro)
- [ ] Adicionar mais recebimentos conforme ocorrerem

---

*Documentação atualizada em 20/01/2025*
*Projeto: VisãoBIM Fluxo*
*Supabase Project ID: kfwqjlokyealnkiqnnsc*
*GitHub: https://github.com/AIgorrocha/visaobim-fluxo*
