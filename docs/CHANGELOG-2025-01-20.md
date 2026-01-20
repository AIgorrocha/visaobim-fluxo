# Changelog - 20 de Janeiro de 2025

Documentação completa de todas as alterações realizadas no sistema VisãoBIM Fluxo.

---

## Resumo das Alterações

| Área | Descrição |
|------|-----------|
| Frontend | Remoção status FINALIZADO, nova aba Visão Geral |
| Backend/Supabase | Nova tabela contract_income, atualização de projetos |
| GitHub | 3 commits principais |

---

## Commits Realizados

### 1. `4e1a3bd` - feat: Adicionar sincronização em tempo real para dados financeiros

**Arquivos modificados:**
- `src/hooks/useRealtimeSync.ts`
- `src/contexts/SupabaseDataContext.tsx`
- `src/pages/MeuFinanceiro.tsx`

**Mudanças:**
- Adicionado listeners de real-time para tabelas financeiras:
  - `designer_payments`
  - `project_pricing`
  - `disciplines`
- Hooks financeiros adicionados ao contexto global
- Removido "(40%)" do header "Sua Parte" em MeuFinanceiro

---

### 2. `48af59d` - feat: Dashboard financeiro com visão geral de contratos

**Arquivos modificados:**
- `src/types/index.ts` - Removido FINALIZADO do tipo status
- `src/pages/Projetos.tsx` - Removido FINALIZADO dos filtros e badges
- `src/components/ProjectModal.tsx` - Removido FINALIZADO do select
- `src/hooks/useUserData.tsx` - Removido FINALIZADO do filtro de projetos concluídos
- `src/pages/AdminFinanceiro.tsx` - Nova aba "Visão Geral"
- `src/hooks/useContractFinancials.ts` - **NOVO** hook para dados de contratos

**Mudanças no código:**

1. **Status FINALIZADO removido** - Agora só existe CONCLUIDO
2. **Nova aba "Visão Geral"** no Admin Financeiro com:
   - Cards de resumo (Total Contratos, Recebido, A Receber, etc.)
   - Tabela de Contratos Públicos com totais
   - Tabela de Contratos Privados com totais
3. **Novo hook** `useContractFinancials.ts` para buscar e calcular dados

---

### 3. `cbb183f` - fix: Remover coluna Margem da Visão Geral

**Arquivos modificados:**
- `src/pages/AdminFinanceiro.tsx`

**Mudanças:**
- Removido card "Margem Bruta"
- Removido coluna "Margem" das tabelas de contratos
- Motivo: Custos completos ainda não estão sendo lançados

---

## Alterações no Supabase

### 1. Atualização de Status de Projetos

```sql
-- Projetos atualizados de FINALIZADO para CONCLUIDO
UPDATE projects SET status = 'CONCLUIDO' WHERE status = 'FINALIZADO';
```

**Projetos afetados:**
| ID | Nome | Status Anterior | Status Novo |
|----|------|-----------------|-------------|
| 04e09afb-8b45-4ab8-b6ff-8e57dd0ed0b5 | DELEGACIA POLICIA FEDERAL | FINALIZADO | CONCLUIDO |
| 5d68fb6e-1e5f-4d3d-9fd6-e5bcef8c3ca6 | SHOPPING INDEPENDENCIA | FINALIZADO | CONCLUIDO |

---

### 2. Nova Tabela: `contract_income`

**Migration aplicada:** `create_contract_income_table`

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

-- Índices
CREATE INDEX idx_contract_income_project ON contract_income(project_id);
CREATE INDEX idx_contract_income_date ON contract_income(income_date);

-- RLS habilitado
-- Admin pode tudo, usuários podem ver
```

**Propósito:** Registrar receitas de contratos (medições, entradas, parcelas)

---

### 3. Atualização de Valores de Contrato

**Projetos existentes atualizados com project_value:**

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

### 4. Novos Projetos Criados

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

### 5. Recebimentos Cadastrados na `contract_income`

#### Medições Públicas
| Data | Projeto | Valor | Descrição |
|------|---------|-------|-----------|
| 24/06/2025 | CAMPUS CURITIBA | R$ 16.152,30 | 1ª medição |
| 01/09/2025 | DRF-PV | R$ 29.812,14 | 1ª medição |
| 21/10/2025 | CELESC_TUBARAO | R$ 12.672,75 | 1ª medição |
| 01/12/2025 | LOTE 02 - TRE-AC | R$ 35.308,63 | 1ª medição |

#### Recebimentos Privados
| Projeto | Valor Recebido | Descrição |
|---------|----------------|-----------|
| BRENO-CASA | R$ 23.300,00 | Pagamentos recebidos |
| IRIS-REFORCO EST | R$ 4.000,00 | Pagamento total (100%) |
| TALISMA-ESCOLA | R$ 42.871,95 | Pagamentos recebidos |
| FENIX-COWORKING | R$ 16.000,00 | Pagamentos recebidos |
| ACADEMIA | R$ 6.800,00 | Pagamentos recebidos |
| ROSANETE E ESEQUIAS | R$ 2.750,00 | Entrada 50% |
| THALES-GILVANDO&CARINE | R$ 2.750,00 | Entrada 50% |
| THALES-CLEBER&IGOR | R$ 4.500,00 | Pagamento total (100%) |
| ORÇAMENTO | R$ 2.500,00 | Pagamentos recebidos |
| LAIS E SAROM | R$ 2.500,00 | Entrada 50% |
| INCÊNDIO | R$ 8.000,00 | Pagamentos recebidos |
| CASA PABLO | R$ 14.000,00 | Entrada 50% |
| PORTAL DA ALEGRIA | R$ 19.000,00 | Pagamentos recebidos |

**Total de 17 recebimentos cadastrados**

---

## Resumo dos Totais Cadastrados

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

## Arquivos Novos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useContractFinancials.ts` | Hook para buscar e calcular dados de contratos |
| `docs/CHANGELOG-2025-01-20.md` | Este arquivo de documentação |

---

## Observações Importantes

1. **Status FINALIZADO** - Completamente removido do sistema. Use apenas CONCLUIDO.

2. **Coluna Margem** - Removida temporariamente pois não estão sendo lançados todos os custos.

3. **Dados de Projetistas** - O campo "Pago Projetistas" nas tabelas vem da tabela `designer_payments` (pagamentos com status 'pago').

4. **Dados de Contratos** - O campo "A Pagar Projetistas" é calculado com base nas precificações (`project_pricing.designer_value`).

5. **BRENO-CASA** - Falta pagar R$ 1.300 ao Rondinelly (climatização).

---

## Próximos Passos Sugeridos

- [ ] Lançar custos dos projetos (além de pagamentos a projetistas)
- [ ] Adicionar coluna "Margem" de volta após lançar custos
- [ ] Configurar integração com AppSheet/Google Sheets (futuro)
- [ ] Adicionar mais recebimentos conforme forem ocorrendo

---

*Documentação gerada em 20/01/2025*
*Projeto: VisãoBIM Fluxo*
*Supabase Project ID: kfwqjlokyealnkiqnnsc*
