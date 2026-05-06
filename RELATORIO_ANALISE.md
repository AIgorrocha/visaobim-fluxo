# Relatório de Análise — VisaoBIM Fluxo

> Gerado em: 2026-03-20
> Projeto: visaobim-fluxo-main
> Supabase Project ID: kfwqjlokyealnkiqnnsc | Região: sa-east-1 (São Paulo)

---

## 1. Estrutura Geral de Pastas

```
visaobim-fluxo-main/
├── src/
│   ├── components/         # Componentes React de UI (botões, modais, tabelas, etc.)
│   ├── contexts/           # Contextos React (autenticação, tema, etc.)
│   ├── hooks/              # Lógica de acesso ao banco (CRUD via Supabase JS)
│   ├── integrations/       # Tipos TypeScript gerados automaticamente pelo Supabase
│   │   └── supabase/
│   │       └── types.ts    # Tipos de todas as tabelas (auto-gerado)
│   ├── lib/
│   │   └── supabase.ts     # Inicialização do cliente Supabase
│   ├── pages/              # Telas da aplicação (uma por funcionalidade)
│   │   ├── Projetos.tsx
│   │   ├── MinhasTarefas.tsx
│   │   ├── Propostas.tsx
│   │   ├── PrecificacaoProjetos.tsx
│   │   ├── AdminFinanceiro.tsx
│   │   ├── MeuFinanceiro.tsx
│   │   └── Configuracoes.tsx
│   ├── providers/          # Providers de contexto (React Query, Auth, etc.)
│   ├── scripts/            # Scripts utilitários de processamento de dados
│   ├── types/
│   │   └── index.ts        # Tipos TypeScript do domínio da aplicação
│   └── utils/              # Funções utilitárias diversas
├── supabase/
│   ├── functions/          # Edge Functions (Deno/serverless no Supabase)
│   │   ├── appsheet-lancamento-pub/
│   │   │   └── index.ts    # Webhook do AppSheet — setor PÚBLICO (v27)
│   │   ├── appsheet-lancamento-pvt/
│   │   │   └── index.ts    # Webhook do AppSheet — setor PRIVADO (v21)
│   │   └── create-users/
│   │       └── index.ts    # Criação de usuários no Supabase Auth
│   └── migrations/         # 45+ arquivos SQL de migração do banco
├── docs/                   # Documentação interna de sessões e decisões
├── public/                 # Assets estáticos
├── .env                    # Variáveis de ambiente (NÃO versionar senhas)
├── package.json            # Dependências do projeto
└── RELATORIO_ANALISE.md    # Este arquivo
```

---

## 2. Schema do Banco de Dados (Supabase)

### 2.1 `profiles` — Usuários do sistema

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `email` | TEXT UNIQUE | Email do usuário |
| `full_name` | TEXT | Nome completo |
| `role` | TEXT | `'admin'` ou `'user'` |
| `avatar_url` | TEXT | nullable |
| `is_active` | BOOLEAN | nullable |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 2.2 `projects` — Contratos/Projetos

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | TEXT | Nome do contrato/projeto |
| `client` | TEXT | Nome do cliente/órgão |
| `type` | TEXT | `'privado'` ou `'publico'` |
| `status` | TEXT | `EM_ANDAMENTO`, `CONCLUIDO`, `AGUARDANDO_PAGAMENTO`, `PARALISADO`, `EM_ESPERA` |
| `description` | TEXT | nullable |
| `responsible_ids` | UUID[] | Array de UUIDs dos projetistas responsáveis |
| `dependency_id` | UUID | nullable — referência a projeto pai |
| `contract_start` | DATE | Início do contrato |
| `contract_end` | DATE | Fim do contrato |
| `prazo_vigencia` | DATE | Prazo de vigência |
| `project_value` | DECIMAL | Valor total do contrato |
| `amount_paid` | DECIMAL | Valor já recebido |
| `amount_pending` | DECIMAL | Valor a receber |
| `expenses` | DECIMAL | Despesas do projeto |
| `profit_margin` | DECIMAL | Margem de lucro |
| `art_emitida` | BOOLEAN | nullable — ART emitida? |
| `is_archived` | BOOLEAN | Soft-delete |
| `created_by` | UUID | FK → profiles |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 2.3 `tasks` — Tarefas

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `project_id` | UUID | FK → projects |
| `title` | TEXT | Título da tarefa |
| `description` | TEXT | nullable |
| `assigned_to` | TEXT[] | Array de IDs dos usuários atribuídos |
| `status` | TEXT | `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`, `PARALISADA`, `EM_ESPERA` |
| `phase` | TEXT | `ESTUDO_PRELIMINAR`, `PROJETO_BASICO`, `EXECUTIVO` |
| `priority` | TEXT | `baixa`, `media`, `alta` |
| `points` | INTEGER | Pontos de gamificação ao concluir |
| `activity_start` | DATE | Início planejado |
| `due_date` | DATE | Prazo de entrega |
| `last_delivery` | DATE | nullable — última entrega |
| `comment` | TEXT | nullable |
| `dependencies` | TEXT[] | Disciplinas que precisam ser concluídas antes |
| `restricoes` | JSON | nullable — campo legado depreciado |
| `completed_at` | TIMESTAMPTZ | nullable — quando foi concluída |
| `is_archived` | BOOLEAN | Soft-delete |
| `created_at` | TIMESTAMPTZ | |

---

### 2.4 `proposals` — Propostas Comerciais (inclui rastreamento de reuniões)

> Não há tabela específica para reuniões. Reuniões são rastreadas via campos desta tabela.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `client_name` | TEXT | Nome do cliente |
| `proposal_date` | DATE | Data da proposta |
| `proposal_value` | DECIMAL | Valor proposto |
| `last_meeting` | DATE | nullable — data da última reunião |
| `proposal_link` | TEXT | nullable — link para documento da proposta |
| `followup_date` | DATE | nullable — data de follow-up agendado |
| `status` | TEXT | `pendente`, `aprovada`, `rejeitada`, `negociando` |
| `notes` | TEXT | nullable — observações |
| `created_by` | UUID | FK → profiles |
| `is_archived` | BOOLEAN | Soft-delete |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 2.5 `disciplines` — Disciplinas (lista de referência)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | TEXT UNIQUE | Ex: `ESTRUTURAL`, `ELETRICO`, `HIDROSSANITARIO`, `CLIMATIZACAO`, `ARQUITETURA` |
| `description` | TEXT | nullable |
| `display_order` | INT | Ordem de exibição |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

**Disciplinas unificadas (padronização aplicada em 2026-03-04):**
- `HIDROSSANITARIO` (inclui variações: HIDROSSANITARIO/DRENAGEM PLUVIAL)
- `ELETRICO E CABEAMENTOS`
- `ESTRUTURAS` (inclui ESTRUTURAL, Estruturas, ESTRUTURAS CONCRETO ARMADO)
- `ESTRUTURAS_METALICAS` (mantido separado)
- Sem acentos (ex: `SUBESTACAO`, não `SUBESTAÇÃO`)

---

### 2.6 `project_pricing` — Precificação por Disciplina/Projeto

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `project_id` | UUID | FK → projects |
| `discipline_id` | UUID | nullable — FK → disciplines |
| `discipline_name` | TEXT | Nome desnormalizado da disciplina |
| `total_value` | DECIMAL | Valor do contrato para essa disciplina |
| `designer_percentage` | DECIMAL | Percentual do projetista (ex: 40.0) |
| `designer_value` | DECIMAL | Calculado: total_value × designer_percentage / 100 |
| `designer_id` | UUID | nullable — FK → profiles |
| `amount_paid` | DECIMAL | Valor já pago ao projetista nessa disciplina |
| `majoracao` | DECIMAL | nullable — multiplicador de majoração |
| `notes` | TEXT | nullable |
| `status` | TEXT | `pendente`, `parcial`, `pago` |
| `created_by` | UUID | FK → profiles |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Constraint UNIQUE:** `(project_id, discipline_name)`

---

### 2.7 `designer_payments` — Pagamentos aos Projetistas

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `project_id` | UUID | nullable |
| `project_name` | TEXT | nullable — desnormalizado |
| `pricing_id` | UUID | nullable — FK → project_pricing |
| `designer_id` | UUID | FK → profiles |
| `discipline` | TEXT | Nome da disciplina |
| `amount` | DECIMAL | Valor do pagamento |
| `payment_date` | DATE | Data do pagamento |
| `description` | TEXT | nullable |
| `sector` | TEXT | `'privado'` ou `'publico'` |
| `invoice_number` | TEXT | nullable — número da nota fiscal |
| `contract_reference` | TEXT | nullable — referência do contrato |
| `supervisor_id` | UUID | nullable — supervisor de estagiário |
| `status` | TEXT | `pendente`, `pago`, `cancelado` |
| `appsheet_id` | TEXT | Chave de deduplicação do AppSheet (UNIQUE) |
| `created_by` | UUID | FK → profiles |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 2.8 `contract_income` — Receitas dos Contratos

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `project_id` | UUID | nullable — NULL = receita "GERAL" |
| `amount` | DECIMAL | Valor da receita |
| `income_date` | DATE | Data do recebimento |
| `income_type` | TEXT | `medicao`, `parcela`, `entrada` |
| `description` | TEXT | nullable |
| `created_by` | UUID | nullable — FK → profiles |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 2.9 `company_expenses` — Despesas da Empresa

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `project_id` | UUID | nullable |
| `amount` | DECIMAL | Valor da despesa |
| `cost_center` | TEXT | Centro de custo |
| `expense_date` | DATE | Data da despesa |
| `description` | TEXT | Descrição |
| `contract_name` | TEXT | nullable |
| `responsible` | TEXT | nullable |
| `sector` | TEXT | nullable |
| `created_by` | UUID | nullable — FK → profiles |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### 2.10 `contact_leads` — Leads de Contato (formulário externo)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | INT | Auto-increment |
| `name` | TEXT | |
| `email` | TEXT | |
| `phone` | TEXT | nullable |
| `client_type` | TEXT | nullable |
| `project_type` | TEXT | nullable |
| `area` | TEXT | nullable — área em m² |
| `floors` | TEXT | nullable — número de pavimentos |
| `city` | TEXT | nullable |
| `state` | TEXT | nullable |
| `message` | TEXT | nullable |
| `project_files` | TEXT[] | nullable — links de arquivos |
| `source` | TEXT | nullable — origem do lead |
| `created_at` | TIMESTAMPTZ | |

---

### 2.11 `task_restrictions` — Restrições entre Tarefas

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `waiting_task_id` | UUID | FK → tasks (tarefa bloqueada) |
| `blocking_task_id` | UUID | FK → tasks (tarefa que bloqueia) |
| `blocking_user_id` | UUID | FK → profiles |
| `status` | TEXT | `active`, `resolved`, `cancelled` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `resolved_at` | TIMESTAMPTZ | nullable |

---

### 2.12 `task_notifications` — Notificações de Tarefas

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → profiles |
| `task_id` | UUID | FK → tasks |
| `type` | TEXT | `task_released`, `restriction_added`, `task_completed` |
| `title` | TEXT | |
| `message` | TEXT | |
| `read` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

---

### 2.13 `achievements` — Gamificação (Conquistas)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → profiles |
| `achievement_type` | TEXT | Tipo da conquista |
| `title` | TEXT | Título exibido |
| `description` | TEXT | Descrição |
| `icon` | TEXT | nullable |
| `points_earned` | INTEGER | Pontos ganhos |
| `unlocked` | BOOLEAN | Desbloqueado? |
| `earned_at` | TIMESTAMPTZ | |

---

### 2.14 `activity_logs` — Log de Atividades

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK → profiles |
| `action` | TEXT | Ação executada |
| `entity_type` | TEXT | Tipo da entidade afetada |
| `entity_id` | UUID | ID da entidade afetada |
| `details` | JSONB | Dados detalhados da ação |
| `ip_address` | INET | nullable |
| `user_agent` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | |

---

### 2.15 Views do Banco (Relatórios)

| View | Descrição |
|---|---|
| `vw_financial_overview` | Visão geral financeira consolidada |
| `vw_monthly_balance` | Balanço mensal (receita vs despesa) |
| `vw_monthly_category_summary` | Resumo mensal por categoria |
| `vw_recurring_expenses` | Identifica despesas recorrentes |
| `vw_spending_alerts` | Alertas de gastos fora do padrão |
| `designer_financial_summary` | Resumo financeiro por projetista |
| `designer_receivables` | A receber por projetista/projeto |
| `task_restrictions_detailed` | Restrições de tarefas com nomes completos |

---

## 3. Tabelas por Categoria de Uso

| Categoria | Tabelas envolvidas |
|---|---|
| **Contratos** | `projects`, `project_pricing`, `contract_income` |
| **Tarefas** | `tasks`, `task_restrictions`, `task_notifications` |
| **Reuniões** | Sem tabela dedicada — rastreadas em `proposals` (campos `last_meeting`, `followup_date`) |
| **Propostas** | `proposals` |
| **Clientes/Leads** | `contact_leads`, `proposals.client_name` |
| **Financeiro projetistas** | `designer_payments`, `project_pricing` |
| **Despesas** | `company_expenses` |
| **Usuários** | `profiles` |
| **Gamificação** | `achievements` |
| **Auditoria** | `activity_logs` |

---

## 4. Como os Dados São Inseridos

### 4.1 Hooks React (frontend → Supabase direto)

Localizados em `src/hooks/`. Cada hook usa o Supabase JS client.

#### `useSupabaseData.ts` — Dados principais
```typescript
// PROJETOS
useProjects()           // Listar/criar/atualizar/arquivar projetos
useArchivedProjects()   // Projetos arquivados
createProject(data)
updateProject(id, updates)
archiveProject(id)

// TAREFAS
useTasks()              // Listar/criar/atualizar/arquivar tarefas
createTask(data)
updateTask(id, updates)
archiveTask(id)
getTasksByUser(userId)  // Tarefas de um usuário específico

// PROPOSTAS
useProposals()
createProposal(data)
updateProposal(id, updates)
archiveProposal(id)

// USUÁRIOS
useProfiles()
```

#### `useDesignerFinancials.ts` — Financeiro dos projetistas
```typescript
useDisciplines()              // Lista de disciplinas
useProjectPricing()           // Precificação por projeto/disciplina
useDesignerPayments()         // Pagamentos a projetistas
createProjectPricing(data)
updateProjectPricing(id, data)
createDesignerPayment(data)
updateDesignerPayment(id, data)
getDesignerStats(designerId)  // Resumo financeiro do projetista
```

#### `useContractFinancials.ts` — Receitas de contratos
```typescript
useContractIncome()
createContractIncome(data)
updateContractIncome(id, data)
getContractRevenue(projectId)
```

#### `useCompanyExpenses.ts` — Despesas da empresa
```typescript
useCompanyExpenses()
createCompanyExpense(data)
updateCompanyExpense(id, data)
getExpenseStats()
```

### 4.2 Edge Functions (webhooks do AppSheet → Supabase)

Localizadas em `supabase/functions/`. Executadas como serverless no Supabase.

#### `appsheet-lancamento-pub` (v27) — Setor Público
- URL: `https://kfwqjlokyealnkiqnnsc.supabase.co/functions/v1/appsheet-lancamento-pub`
- Método: POST (webhook chamado pelo AppSheet)
- **O que faz:**
  1. Recebe payload do AppSheet com dados de lançamento
  2. Mapeia nome do contrato (AppSheet) → UUID do projeto (Supabase)
  3. Mapeia nome do projetista (AppSheet) → UUID do perfil (Supabase)
  4. Converte valor em formato brasileiro (ex: `1.234,50` → `1234.50`)
  5. Verifica se `appsheet_id` já existe (proteção anti-duplicata)
  6. Insere em `designer_payments`
  7. Fallback: projetista desconhecido → "PROJETISTA EXTERNO" (UUID: `4c3ce88b`)

**Mapeamentos de contratos (AppSheet → Supabase UUID):**
```
PRODESP              → (ID interno)
SPRF-AL              → 4280b63b-15a6-459e-916b-15650b1679df
SPF-RO               → 488c5ba6-7ef0-429e-8650-139d36f0179d
FHEMIG-BH            → 855b0ae2-af3d-483b-9aae-9b489acbcc9c
IBC-RJ               → 46195969-2413-4782-8753-0002fd633655
CIAP-SP              → 0083d03a-01f4-4d35-bb8e-e8501a17109e
ZOOTECNIA-USP        → 91a2dfd8-d0e1-4bb0-8b0d-f9d43ac0d3a3
LORENA-SP            → 67c376a8-f269-4529-8cc0-26d99cd7bd28
UNESPAR-ESTRUTURA    → 9de6e94a-bce4-4ab5-9923-1081d0a9eba1
HTR (FES-HTR)        → 3142ffab-1005-4710-9fb0-e838ba069e97
```

**Mapeamentos de projetistas:**
```
NARA, GUSTAVO, PEDRO/LUCAS, LEONARDO, RONDINELLY, THIAGO
ELOISY, EDILSON, FERNANDO, FABIO, FELIPE MATHEUS
SALOMAO, ARTHUR, IGOR, NICOLAS, BESSA, PHILIP, LISBOA
PROJETISTA EXTERNO (fallback)
```

#### `appsheet-lancamento-pvt` (v21) — Setor Privado
- Mesmo comportamento da função pública, mas com mapeamentos do setor privado

#### `create-users` — Criação de usuários
- Cria usuários no Supabase Auth e insere perfil em `profiles`

---

## 5. Endpoints e Funções Disponíveis para Inserção de Dados

### 5.1 Criar/Atualizar Contrato (Projeto)
```typescript
// Campos obrigatórios
createProject({
  name: string,               // Nome do contrato
  client: string,             // Nome do cliente/órgão
  type: 'privado' | 'publico',
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'AGUARDANDO_PAGAMENTO' | 'PARALISADO' | 'EM_ESPERA',
  responsible_ids: string[],  // Array de UUIDs dos projetistas
  created_by: string,         // UUID do usuário criador

  // Opcionais
  description?: string,
  contract_start?: string,    // Formato: 'YYYY-MM-DD'
  contract_end?: string,
  prazo_vigencia?: string,
  project_value?: number,
  art_emitida?: boolean,
  dependency_id?: string,
})
```

### 5.2 Criar/Atualizar Tarefa
```typescript
createTask({
  project_id: string,         // UUID do projeto
  title: string,
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PARALISADA' | 'EM_ESPERA',
  phase: 'ESTUDO_PRELIMINAR' | 'PROJETO_BASICO' | 'EXECUTIVO',
  priority: 'baixa' | 'media' | 'alta',

  // Opcionais
  description?: string,
  assigned_to?: string[],     // Array de UUIDs dos usuários
  activity_start?: string,    // 'YYYY-MM-DD'
  due_date?: string,          // 'YYYY-MM-DD'
  dependencies?: string[],    // Disciplinas que devem ser concluídas antes
  points?: number,
  comment?: string,
})
```

### 5.3 Criar/Atualizar Proposta (e rastrear reunião)
```typescript
createProposal({
  client_name: string,
  proposal_date: string,       // 'YYYY-MM-DD'
  proposal_value: number,
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'negociando',
  created_by: string,          // UUID

  // Campos de reunião
  last_meeting?: string,       // 'YYYY-MM-DD' — data da última reunião
  followup_date?: string,      // 'YYYY-MM-DD' — próximo contato

  // Opcionais
  proposal_link?: string,
  notes?: string,
})
```

### 5.4 Criar Precificação (por disciplina/projeto)
```typescript
createProjectPricing({
  project_id: string,          // UUID do projeto
  discipline_name: string,     // Nome da disciplina (ex: 'ESTRUTURAL')
  total_value: number,         // Valor contratado para essa disciplina
  designer_id: string,         // UUID do projetista
  designer_percentage: number, // Ex: 40 (significa 40%)
  created_by: string,          // UUID

  // Opcionais
  discipline_id?: string,      // UUID da disciplina (se existir)
  majoracao?: number,
  notes?: string,
  status?: 'pendente' | 'parcial' | 'pago',
})
```

### 5.5 Registrar Pagamento ao Projetista
```typescript
createDesignerPayment({
  designer_id: string,         // UUID do projetista
  project_id: string,          // UUID do projeto
  discipline: string,          // Nome da disciplina
  amount: number,              // Valor do pagamento
  payment_date: string,        // 'YYYY-MM-DD'
  sector: 'privado' | 'publico',
  status: 'pendente' | 'pago' | 'cancelado',
  created_by: string,          // UUID

  // Opcionais
  pricing_id?: string,
  project_name?: string,
  description?: string,
  invoice_number?: string,
  contract_reference?: string,
  supervisor_id?: string,
})
```

### 5.6 Registrar Receita de Contrato
```typescript
createContractIncome({
  project_id: string | null,   // UUID do projeto (null = GERAL)
  amount: number,
  income_date: string,         // 'YYYY-MM-DD'
  income_type: 'medicao' | 'parcela' | 'entrada',

  // Opcionais
  description?: string,
  created_by?: string,
})
```

### 5.7 Registrar Despesa da Empresa
```typescript
createCompanyExpense({
  amount: number,
  expense_date: string,        // 'YYYY-MM-DD'
  description: string,
  cost_center: string,

  // Opcionais
  project_id?: string,
  contract_name?: string,
  responsible?: string,
  sector?: string,
  created_by?: string,
})
```

---

## 6. Configuração de Conexão com Supabase

### Variáveis de ambiente (arquivo `.env`)
```
VITE_SUPABASE_URL=https://kfwqjlokyealnkiqnnsc.supabase.co
VITE_SUPABASE_ANON_KEY=<chave pública — não expor em repositório público>
```

### Inicialização do cliente (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Informações do projeto Supabase
```
Project ID : kfwqjlokyealnkiqnnsc
Região     : sa-east-1 (São Paulo, Brasil)
URL base   : https://kfwqjlokyealnkiqnnsc.supabase.co
Dashboard  : https://supabase.com/dashboard/project/kfwqjlokyeanlkiqnnsc
```

### Edge Functions — URLs
```
appsheet-lancamento-pub : POST /functions/v1/appsheet-lancamento-pub
appsheet-lancamento-pvt : POST /functions/v1/appsheet-lancamento-pvt
create-users            : POST /functions/v1/create-users
```

---

## 7. Segurança — Row Level Security (RLS)

RLS ativado nas tabelas:
- `profiles`, `projects`, `tasks`, `proposals`
- `achievements`, `activity_logs`
- `disciplines`, `project_pricing`, `designer_payments`

**Regras principais:**
- Projetistas (`role = 'user'`) veem apenas projetos onde estão em `responsible_ids`
- Admins veem tudo
- Projetistas veem apenas seus próprios pagamentos em `designer_payments`
- Tarefas visíveis apenas se o usuário está em `assigned_to` ou é admin

**IMPORTANTE:** Ao adicionar precificação, garantir que o projetista (`designer_id`) está incluído no array `responsible_ids` do projeto. Caso contrário, o projetista não verá o projeto por causa do RLS.

---

## 8. Integrações Externas

### 8.1 AppSheet → Supabase (ATIVA)
- **Direção:** AppSheet chama Edge Functions do Supabase via webhook
- **Sentido:** Unidirecional (AppSheet → Supabase, sem retorno)
- **O que envia:** Lançamentos de pagamentos a projetistas
- **Proteção anti-duplicata:** Campo `appsheet_id` com constraint UNIQUE
- **Bug conhecido (resolvido 2026-02-06):** AppSheet chamava webhook duas vezes por lançamento — resolvido com deduplicação

### 8.2 WhatsApp
- **Não existe** — nenhuma integração encontrada no código

### 8.3 Email
- **Não existe** — nenhuma integração encontrada no código

### 8.4 Calendário
- **Não existe** — datas de reuniões são armazenadas em `proposals.last_meeting` e `proposals.followup_date`, mas sem sincronização com Google Calendar, Outlook ou similar

---

## 9. Dependências Principais (package.json)

| Pacote | Versão | Uso |
|---|---|---|
| `@supabase/supabase-js` | 2.57.4 | Cliente do banco de dados |
| `react` | 18.x | Framework de UI |
| `react-router-dom` | 6.x | Navegação entre telas |
| `@tanstack/react-query` | 5.x | Cache e busca de dados |
| `react-hook-form` | 7.x | Gerenciamento de formulários |
| `zod` | 3.x | Validação de dados |
| `recharts` | 2.x | Gráficos financeiros |
| `tailwindcss` | 3.x | Estilização |
| `@radix-ui/*` | — | Componentes de UI acessíveis |

---

## 10. IDs Importantes (Supabase)

### Projetistas (profiles.id)
```
BESSA           : c96e4c49-...
LEONARDO        : 5d9e3d5a-...
PEDRO/LUCAS     : 7b13b7de-...
EDILSON         : cc32897a-...
FERNANDO        : 99d8b596-...
FELIPE MATHEUS  : 60a9b85e-...
SALOMAO         : 719d76a2-...
RONDINELLY      : 905fde13-...
LISBOA          : d90fcfdb-...
PHILIP          : 6fefce39-...
IGOR            : cf3a3c2b-...
PROJETISTA EXT  : 4c3ce88b-... (fallback AppSheet)
```

---

## 11. Observações e Decisões de Arquitetura

1. **Reuniões não têm tabela própria** — são rastreadas via `proposals.last_meeting` e `proposals.followup_date`. Se precisar de uma agenda completa de reuniões, seria necessário criar nova tabela.

2. **`project_id = NULL` em contract_income** — significa entrada "GERAL" (não vinculada a projeto específico). Não existe um projeto chamado GERAL.

3. **Pagamentos de projetistas com 2+ disciplinas** — bug histórico onde `amount_paid` duplicava. Corrigido em 2026-03-04 no frontend (`useDesignerFinancials.ts`) usando `Math.max()` ao invés de `+=`.

4. **AppSheet não usa acentos** — todos os mapeamentos nas Edge Functions são sem acentos para evitar erros de comparação de strings.

5. **CELESC-RS ≠ CELESC-ESTUDO** — contratos distintos (Tubarão vs Estação Central). Não confundir.

6. **ZOOBOTANICO tem 3 sub-projetos**: PARQUE AQUATICO, INCENDIO, CASA — cada um com UUID próprio.

7. **PRODESP** — pagamentos são do setor PÚBLICO, mesmo que o nome não deixe isso explícito.

---

*Fim do relatório — gerado pela análise de 45+ migrations SQL, 3 Edge Functions, e múltiplos hooks React.*
