# Changelog Completo - Sistema VisãoBIM Fluxo

Documentação completa de todas as alterações realizadas no sistema.

---

## Commits de 20 de Janeiro de 2026 (Sessão Atual)

### Commits Mais Recentes (após a sessão anterior)

| # | Commit | Tipo | Descrição | Data |
|---|--------|------|-----------|------|
| 1 | `bb42044` | feat | Adicionar dashboards visuais na Gestão Financeira | 20/01/2026 |
| 2 | `c0df6f6` | fix | Ajustar coluna Saldo para não quebrar linha + instrução filtros múltiplos | 20/01/2026 |
| 3 | `5de673d` | fix | Remover card Pendente do dashboard Gestão Financeira | 20/01/2026 |
| 4 | `26b289a` | docs | Criar arquivo de mensagens para envio individual | 20/01/2026 |
| 5 | `aae8c8c` | docs | Atualizar credenciais completas com instrução de troca de senha | 20/01/2026 |
| 6 | `3d78ec9` | fix | Corrigir URL do sistema para visaobim.lovable.app | 20/01/2026 |
| 7 | `eefaa63` | feat | Restringir acesso de áreas financeiras para Igor e Stael | 20/01/2026 |
| 8 | `94f6e96` | fix | Remover opcao pendente dos pagamentos | 20/01/2026 |
| 9 | `92c144d` | fix | Excluir contratos EM_ESPERA de todos os calculos financeiros | 20/01/2026 |
| 10 | `b8b9313` | feat | Multi-selecao de status e cliente nos contratos | 20/01/2026 |
| 11 | `03851a0` | feat | Adicionar filtros avancados e cards clicaveis no Admin Financeiro | 20/01/2026 |
| 12 | `dcafcd6` | feat | Adicionar modal de detalhes do contrato na Visão Geral | 20/01/2026 |
| 13 | `0dafd44` | feat | Adicionar filtros avançados no Admin Financeiro | 20/01/2026 |
| 14 | `2dfb286` | feat | Integrar despesas com contratos na Visão Geral | 20/01/2026 |
| 15 | `a9bf065` | feat | Adicionar aba Despesas no Admin Financeiro | 20/01/2026 |
| 16 | `4034756` | feat | Sincronização automática de pagamentos com precificação | 20/01/2026 |
| 17 | `d3a5844` | docs | Atualizar documentação com todos os 18 commits do dia | 20/01/2026 |
| 18 | `109b10e` | docs | Documentação completa das alterações de 20/01/2025 | 20/01/2026 |

---

## Detalhamento dos Commits Recentes

### 1. `bb42044` - feat: Dashboards Visuais na Gestão Financeira

**Arquivos criados:**
- `src/components/charts/index.ts`
- `src/components/charts/RevenueByTypeChart.tsx` - Gráfico de pizza para receitas por tipo
- `src/components/charts/SectorComparisonChart.tsx` - Gráfico de barras público vs privado
- `src/components/charts/ExpensesByCenterChart.tsx` - Gráfico de rosca para despesas
- `src/components/charts/TopDesignersChart.tsx` - Gráfico de barras horizontais Top 5 projetistas
- `src/components/charts/CashFlowChart.tsx` - Gráfico waterfall de fluxo de caixa

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`
- Integração com biblioteca Recharts
- Seção de dashboards na aba Visão Geral
- Dados calculados via useMemo

**Dependência adicionada:** `recharts`

---

### 2. `c0df6f6` - fix: Ajustes de UI

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`
- Coluna Saldo com `whitespace-nowrap` para valores negativos não quebrarem linha
- Instrução "(selecione vários)" adicionada aos filtros de status e cliente

---

### 3. `5de673d` - fix: Remover card Pendente

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`
- Removido card "Pendente" que mostrava R$ 0,00 (não usado)

---

### 4. `26b289a` - docs: Mensagens de acesso individual

**Arquivo criado:** `docs/MENSAGENS_ACESSO.md`
- Mensagens formatadas para enviar individualmente a cada membro
- Login e senha de cada usuário
- Instruções para trocar senha

---

### 5. `aae8c8c` - docs: Credenciais completas

**Arquivo criado:** `docs/ACESSOS_USUARIOS.md`
- Tabela com todos os 18 usuários
- Padrão de senha: nome@2025
- Instruções para alteração de senha

---

### 6. `3d78ec9` - fix: Corrigir URL

**Arquivos modificados:** Documentação
- URL corrigida para https://visaobim.lovable.app

---

### 7. `eefaa63` - feat: Restringir acesso financeiro

**Arquivo modificado:** `src/pages/PrecificacaoProjetos.tsx`

**Mudança de segurança:**
```typescript
// Antes: verificava role 'admin'
// Agora: verifica email específico
const allowedEmails = ['igor@visaobim.com', 'stael@visaobim.com'];
const hasAccess = user && profile && allowedEmails.includes(profile.email?.toLowerCase() || '');
```

**Páginas restritas a Igor e Stael:**
- Propostas
- Gestão Financeiro
- Precificação

---

### 8. `94f6e96` - fix: Remover opção pendente

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`
- Removida opção "Pendente" dos filtros de pagamento (não existe mais)

---

### 9. `92c144d` - fix: Excluir EM_ESPERA dos cálculos

**Arquivo modificado:** `src/hooks/useContractFinancials.ts`

**Filtro adicionado:**
```typescript
.filter(p => !p.is_archived && p.project_value && p.project_value > 0 && p.status !== 'EM_ESPERA')
```

**Motivo:** Contratos em espera ainda não iniciaram e não devem entrar nos totais.

---

### 10. `b8b9313` - feat: Multi-seleção de filtros

**Arquivo modificado:** `src/pages/AdminFinanceiro.tsx`
- Filtros de status e cliente agora aceitam múltiplas seleções
- Checkboxes dentro do dropdown
- Mudança de `string` para `string[]` nos estados

---

### 11-16. Commits anteriores da sessão

Ver arquivo `CHANGELOG-2025-01-20.md` para detalhes completos.

---

## Commits de 19 de Janeiro de 2026

| # | Commit | Tipo | Descrição |
|---|--------|------|-----------|
| 1 | `db71765` | feat | Restringir acesso de áreas financeiras para Igor e Stael |
| 2 | `c7b6770` | fix | Melhorar validacao de disciplinas duplicadas |
| 3 | `e78be6d` | feat | Adicionar gerenciamento de disciplinas na Precificacao |
| 4 | `2370d43` | feat | Melhorias no sistema financeiro |
| 5 | `a4c0399` | fix | Corrigir registro de pagamentos no Admin Financeiro |
| 6 | `db73c02` | fix | Melhorar filtros de pagamentos no Admin Financeiro |
| 7 | `1a93f8c` | feat | Atualizar tarefas inline |
| 8 | `1cfdc7a` | feat | Changes |
| 9 | `181f20e` | feat | Implementar sistema financeiro de projetistas |

---

## Arquivos Criados (Sessão Atual)

| Arquivo | Descrição |
|---------|-----------|
| `src/components/charts/index.ts` | Export dos componentes de gráficos |
| `src/components/charts/RevenueByTypeChart.tsx` | Pizza de receitas por tipo |
| `src/components/charts/SectorComparisonChart.tsx` | Barras público vs privado |
| `src/components/charts/ExpensesByCenterChart.tsx` | Rosca de despesas por centro |
| `src/components/charts/TopDesignersChart.tsx` | Top 5 projetistas |
| `src/components/charts/CashFlowChart.tsx` | Fluxo de caixa waterfall |
| `docs/ACESSOS_USUARIOS.md` | Credenciais dos usuários |
| `docs/MENSAGENS_ACESSO.md` | Mensagens para envio individual |
| `docs/CHANGELOG-COMPLETO.md` | Esta documentação |

---

## Resumo de Funcionalidades Implementadas

### Sistema Financeiro
- ✅ Visão Geral de contratos (públicos e privados)
- ✅ Filtros avançados com multi-seleção
- ✅ Cards clicáveis para filtrar dados
- ✅ Modal de detalhes do contrato
- ✅ Dashboards visuais (5 gráficos)
- ✅ Aba de Despesas
- ✅ Sincronização em tempo real

### Segurança
- ✅ Acesso restrito por email (Igor e Stael)
- ✅ Páginas protegidas: Propostas, Gestão Financeiro, Precificação
- ✅ Credenciais documentadas para todos os 18 usuários

### UI/UX
- ✅ Multi-seleção de status e cliente
- ✅ Instrução "(selecione vários)" nos filtros
- ✅ Coluna Saldo sem quebra de linha
- ✅ Removido card "Pendente" não utilizado

---

## Projeto AGROPARQUESERVFAZ (SERVFAZ-AGROPARQUE)

**Valor do contrato:** R$ 113.233,29

**Situação:** O projeto não aparece na Visão Geral.

**SQL para verificar/criar o projeto:**
```sql
-- Verificar se existe
SELECT * FROM projects WHERE name ILIKE '%AGROPARQUE%' OR name ILIKE '%SERVFAZ%';

-- Se não existir, criar:
INSERT INTO projects (name, client, type, status, project_value, description, created_by)
SELECT
  'SERVFAZ-AGROPARQUE',
  'AGROPARQUE',
  'privado',
  'EM_ANDAMENTO',
  113233.29,
  'Projeto SERVFAZ Agroparque',
  (SELECT id FROM profiles WHERE email = 'igor@visaobim.com' LIMIT 1);

-- Se existir mas sem valor, atualizar:
UPDATE projects
SET project_value = 113233.29,
    status = 'EM_ANDAMENTO'
WHERE name ILIKE '%AGROPARQUE%' OR name ILIKE '%SERVFAZ%';
```

**Após criar/atualizar:**
O projeto aparecerá automaticamente na Visão Geral (aba Privado) pois atenderá os critérios:
- `is_archived = false`
- `project_value = 113233.29` (> 0)
- `status = 'EM_ANDAMENTO'` (≠ 'EM_ESPERA')

---

## Pagamentos a Verificar

**Query para verificar pagamentos no Supabase:**
```sql
-- Verificar ACADEMIA
SELECT * FROM contract_income WHERE project_id IN (SELECT id FROM projects WHERE name ILIKE '%ACADEMIA%');

-- Verificar TALISMA-ESCOLA
SELECT * FROM contract_income WHERE project_id IN (SELECT id FROM projects WHERE name ILIKE '%TALISMA%');
```

### WILLIAM-ACADEMIA (Projeto: ACADEMIA)
| Data | Valor | Status |
|------|-------|--------|
| 05/11/2025 | R$ 6.800,00 | A verificar |

**Valor do contrato:** R$ 20.500,00
**Valor a receber:** R$ 13.700,00 (se apenas R$ 6.800 recebido)

### TALISMA-ESCOLA
| Data | Valor | Status |
|------|-------|--------|
| 20/12/2025 | R$ 42.871,95 | Documentado no changelog anterior |
| 23/12/2025 | R$ 8.000,00 | A verificar |
| 05/01/2026 | R$ 2.750,00 | A verificar |
| 12/01/2026 | R$ 2.750,00 | A verificar |

**Valor do contrato:** R$ 139.950,00
**Total a verificar:** R$ 56.371,95
**Valor a receber:** R$ 83.578,05 (se todos pagamentos confirmados)

---

## Migration para Inserir Pagamentos

**Arquivo criado:** `supabase/migrations/20260120_insert_missing_payments.sql`

Este arquivo contém:
1. Criação do projeto SERVFAZ-AGROPARQUE (R$ 113.233,29)
2. Inserção do pagamento ACADEMIA (R$ 6.800,00)
3. Inserção dos 4 pagamentos TALISMA-ESCOLA (total R$ 56.371,95)

**Para executar:** Copie o conteúdo do arquivo e execute no SQL Editor do Supabase.

---

## URLs e Acessos

| Sistema | URL |
|---------|-----|
| **Produção** | https://visaobim.lovable.app |
| **Supabase** | kbocaozwfqhwixlmlaap (Project ID) |
| **GitHub** | https://github.com/AIgorrocha/visaobim-fluxo |

---

*Documentação atualizada em 20/01/2026*
*Total de commits documentados: 50+*
