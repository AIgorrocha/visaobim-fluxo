# Sessão 2026-05-10 — Módulo Financeiro Completo

## Resumo executivo

Sessão dedicada a transformar o módulo financeiro placeholder em sistema completo de gestão estratégica para CEO + sócia (Igor + Stael), com sincronização automática AppSheet → Supabase, DRE estruturada, alertas, projeção 12 meses, e controle granular de acesso por setor.

## Stack confirmado

- **Frontend:** Vite + React 18 + TypeScript + shadcn/ui + Tailwind + recharts ^2.15 + framer-motion
- **Backend:** Supabase (project `kfwqjlokyealnkiqnnsc`, sa-east-1, RLS habilitado)
- **Sincronização:** AppSheet (input) → Edge Functions Deno → Supabase Postgres → Realtime → React app
- **Deploy:** GitHub → Lovable (auto-sync)

## Trabalho realizado

### 1. Auditoria + Correção de Dados
**Problema inicial:** AppSheet tinha 768 lançamentos (privado: 149, público: 619); Supabase tinha dados parcialmente importados com discrepâncias.

**Ações:**
- Comparação CSV ↔ Supabase, identificadas 14 duplicatas em `designer_payments` e 2 em `contract_income` (FENIX-COWORKING)
- Lump R$ 23.300 BRENO-CASA substituído por 3 parcelas R$ 6.500 conforme CSV
- Lançamento R$ 4.000 órfão (zoobotanico incêndio) vinculado ao projeto INCÊNDIO
- Reimportação completa do CSV: 70 receitas + 234 designer payments + 446 despesas = 750 lançamentos
- 2 projetos novos criados: `BB-LOTE 05` (público) e `RECEITA-CARUARU` (privado)
- Projeto `SEPOL-RJ` criado
- Projeto `ENGEMAX - RECEITA CARUARU` (público duplicado) arquivado

**Validação final 100%:**
| Setor | Receita | Despesa | Saldo | AppSheet |
|-------|---------|---------|-------|----------|
| PRIVADO | R$ 402.386,19 | R$ 196.118,99 | **R$ 206.267,20** | ✓ bate |
| PÚBLICO | R$ 844.865,76 | R$ 841.958,36 | **R$ 2.907,40** | ✓ bate |

### 2. Edge Functions AppSheet — Reescrita Completa

**Antes:** mapping de contratos com IDs ERRADOS para 4 contratos públicos (SPRF-AL, SPF-RO, FHEMIG-BH, SANTA MARIA-RS), múltiplos contratos novos faltando, BRENO-CASA duplicado em pub/pvt.

**`appsheet-lancamento-pub` v31:**
- IDs reais corrigidos
- Adicionados: BB-LOTE 05, SEPOL-RJ, UFDPAR, SUAPE-ESCOM, HCFAMEMA, FES-LACEN, TRE-MUSEU, TRE-4ANDAR, mais aliases
- BRENO-CASA removido (era erro)
- **UPSERT logic**: quando `appsheet_id` repete, deleta lançamento antigo em todas as 3 tabelas e insere novo. Suporta edição AppSheet < 2min.
- Match exato precede match parcial (evita pegar contrato errado)
- Aceita `MEDICAO` ou `MEDIÇÃO` com acento

**`appsheet-lancamento-pvt` v25:**
- Adicionados: LUCAS-UBS.AGROVILA, PIAUI.HELICE-CASA DA MULHER, ILHA DO BOI-BRUNO, MERCADO-PICOS, RECEITA-CARUARU
- LACEN-PVT, PRODESP-PVT, PARQUE ABERTO, REFORÇO
- Mesma logica UPSERT

### 3. Schema Supabase — Migrations

```sql
-- contract_income (medições previstas)
ALTER TABLE contract_income
  ADD status TEXT DEFAULT 'recebido' CHECK (status IN ('previsto','recebido','cancelado')),
  ADD expected_date DATE,
  ADD blocker TEXT,
  ADD approval_stage TEXT;

-- Plano de contas DRE
CREATE TABLE chart_of_accounts (id, code, name, dre_group, parent_code, is_active);
CREATE TABLE cost_center_dre_map (cost_center PK, dre_group, description);

-- Contas a pagar
CREATE TABLE accounts_payable (id, description, vendor, amount, due_date, paid_date, status,
  cost_center, sector, project_id, is_recurring, recurrence_period, parent_id, notes);

-- Alertas + orçamento
CREATE TABLE financial_alerts (id, alert_type, severity, title, message, ...);
CREATE TABLE budget_vs_actual (year, month, category, sector, budget_amount);

-- Views
CREATE VIEW v_dre_monthly AS ... (agrega receitas + despesas + designer_payments por mês × setor × dre_group);
CREATE VIEW v_payables_aging AS ... (buckets vencimento contas pagar);
CREATE VIEW v_unmapped_lancamentos AS ... (órfãos com project_id null);
CREATE VIEW v_categoria_dre AS ... (mapping cost_center → DRE com totais);

-- Trigger auto-classificação SOFTWARE
CREATE TRIGGER tr_auto_software BEFORE INSERT/UPDATE ON company_expenses
  FOR EACH ROW EXECUTE FUNCTION auto_classify_software_expense();
```

### 4. DRE Estruturada (modelo Brasil PME)

Estrutura final adaptada à realidade da Visão Engenharia (Simples Nacional, sócios Igor + Stael):

```
Receita Bruta (Notas Fiscais)
(−) Simples Nacional / Impostos s/Nota Fiscal     ← IMPOSTOS = deducao
= Receita Líquida
(−) CSP — Custos Diretos (Projetistas, Levantamentos)
= Lucro Bruto
(−) Despesas Administrativas (CREA, contabilidade, taxas)
(−) Despesas Comerciais (portais, anúncios, prospecção)
(−) Tecnologia/Software (Claude, Google, Autodesk)
= ★ LUCRO REAL DA EMPRESA (antes da distribuição)  ← EBITDA = Lucro Real
(−) Distribuição de Lucro — Pró-labore Sócios     ← PROLABORE = distribuicao_lucro
= Saldo Retido na Empresa (após distribuição)
```

**Decisões-chave:**
- **PROLABORE** não é despesa operacional — é distribuição de lucro. Em micro/pequena empresa, sócio puxa dinheiro próprio.
- **IMPOSTOS** = Simples Nacional sobre faturamento (DAS). Empresa Simples não tem imposto sobre lucro separado. Logo: dedução da receita bruta, não imposto sobre lucro.
- **Margem Líquida** calcula sobre `lucroAntesDistribuicao` (= EBITDA) — pró-labore conta como lucro do sócio.

### 5. Dashboard CEO (`/financeiro`)

**8 KPI cards:** Caixa Atual, Custo Fixo Mensal, Break-Even, Cobertura Fixos, Receita Média 3m, Burn Rate, Runway, Backlog Previsto.

**8 abas:**
1. **DRE** — vertical com % receita + Margem Bruta/EBITDA/Líquida + ComposedChart EBITDA mensal + análise horizontal MoM + **Mapeamento Categorias AppSheet → DRE**
2. **Fluxo de Caixa** — ComposedChart receita+despesa+saldo acumulado + saldo mensal + empilhado
3. **Projeção 12m** — AreaChart forecast baseado em média móvel 3m
4. **Custos Fixos** — Pie por categoria + Bar empilhado pub/priv + tabela detalhada
5. **Contratos** — Top 10 margem contribuição
6. **Medições Previstas** — aging buckets + lista próximas
7. **Alertas** — 7 regras automáticas + barra teto Simples
8. **Sazonalidade** — heatmap mês×ano gradiente verde + área histórica
9. **Break-Even** — gauge cobertura + decomposição

**Banner de alertas críticos** acima das tabs quando severidade=critical.

### 6. Alertas Automáticos (`useFinancialAlerts`)

7 regras computadas client-side:
1. Teto Simples Nacional — info (80%), warning (90%), critical (100% R$ 4,8M)
2. Runway crítico — warning (<3m), critical (<1.5m)
3. Cobertura de fixos <100%
4. Medições previstas atrasadas (cobrança)
5. Burn rate >30% da receita média
6. EBITDA negativo no último mês
7. Queda receita MoM >30%

### 7. Páginas novas

**`/medicoes-previstas`:**
- CRUD completo com estágios distintos público (aguardando órgão, NF, empenho) vs privado (aprovação cliente, assinatura, NF, pagamento)
- Campo `blocker` (o que falta para sair)
- Ação 1-clique "Marcar como recebida" → migra `previsto` → `recebido` com data de hoje

**`/contas-pagar`:**
- CRUD com aging (atrasado, 0-7, 8-15, 16-30, 30+)
- Recorrência (mensal → anual)
- Filtros status + setor
- Card destacado vermelho para atrasadas

### 8. Controle de Acesso (`useSectorAccess`)

| Página | Igor | Stael |
|--------|------|-------|
| Dashboard CEO | tudo | só público |
| Gestão Financeira | tudo | só público (4 filtros forçados) |
| Medições Previstas | tudo | só público |
| Contas a Pagar | tudo | só público + geral |
| Projetos | tudo | só público |
| Propostas | sim | bloqueado |

### 9. Lançamentos Órfãos

View `v_unmapped_lancamentos` lista lançamentos com `project_id=NULL` e `contract_name != 'GERAL'` (mapping faltante).

Hoje: **0 órfãos**. Quando aparecer um, mostra em **Gestão Financeira → aba Não Atribuídas**, abaixo de Precificações Não Atribuídas.

### 10. Mapeamento Categorias AppSheet → DRE (visual)

Tabela na aba DRE mostra cada `cost_center` do AppSheet, qual grupo DRE atinge, descrição, contagem e total acumulado. Facilita Igor entender onde cada categoria cai.

## Pontos de atenção / Dívida técnica

1. **Typo na edge function pub v31** — `'SOP-REFORCO': '80deac2b-928f-4177-ab77-984d76944b006'` (extra `0`). Aliases `REFORCO COLEGIO` funcionam, mas se aparecer órfão `SOP-REFORCO`, é por isso. Corrigir.
2. **Bundle 1.58MB** acima de 500KB warning. Code-splitting útil futuramente.
3. **Variável `orfaos` em Financeiro.tsx** ainda fetch mas conteúdo TabsContent removido. Cleanup pendente.
4. **AdminFinanceiro 3084 linhas** — refatorar em componentes menores eventualmente.
5. **OUTROS (R$ 5.316) e GERAL (R$ 2.831)** — possivelmente reclassificar manualmente.

## Backlog próxima sessão

- Validar visualmente Dashboard CEO público após push (margem líquida 37%, prólabore como linha distinta)
- Botão "Vincular projeto" inline na lista de órfãos (UPDATE manual via UI)
- Curva ABC contratos (Pareto)
- Sankey diagram (origem→destino dinheiro) — usar `@nivo/sankey`
- What-if simulator (slider receita -20% → impacto)
- Export PDF DRE/Fluxo (jsPDF + html2canvas)
- Pluggy/Open Finance integration (esforço alto)
- Conciliação bancária via OFX import

## Commits

| Hash | Descrição |
|------|-----------|
| `de587e0` | Dashboard CEO + medições previstas |
| `212712f` | DRE + alertas + projeção + contas a pagar |
| `64ff8d2` | Controle setor + correção saldo |
| `8e16f1a` | Pró-labore reclassificado |
| `08b80be` | Caixa atual bate saldo real (filter EM_ESPERA bug) |
| `53e7c82` | UPSERT edge functions + órfãos |
| `4a44eef` | Stael restrito setor público em todas abas |
| `8e814be` | Pró-labore lucro + impostos dedução + órfãos integrados |

Total: 8 commits, 7 arquivos novos hooks/pages, 2 edge functions reescritas, 5 tabelas + 4 views Supabase, ~2.500 linhas adicionadas no front.

## Como retomar

```bash
cd "C:\PROJETOS GIT\VISAO\visaobim-fluxo-main"
git status              # working tree clean
git log --oneline -10   # últimos commits
npm install             # caso precise
npm run dev             # iniciar localmente
```

Acesso Supabase Dashboard: https://supabase.com/dashboard/project/kfwqjlokyealnkiqnnsc
Edge Functions Logs: Supabase → Edge Functions → appsheet-lancamento-pub/pvt → Logs (filtrar "CONTRATO NAO MAPEADO")
