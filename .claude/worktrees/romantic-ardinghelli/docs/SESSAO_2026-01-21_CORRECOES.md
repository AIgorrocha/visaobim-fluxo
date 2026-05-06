# Sessao 21/01/2026 - Correcoes de Dados e RLS

## Resumo das Correcoes

### 1. Pagamento Duplicado Pedro/Lucas (01/07/2025)
**Problema:** Dois pagamentos de R$ 1.200 para o mesmo projeto BRENO-CASA
- Um tinha `project_id` mas sem `project_name`
- Outro tinha `project_name` mas sem `project_id`

**Solucao:** Mesclados os dados e deletado o duplicado
```sql
UPDATE designer_payments
SET project_name = 'BRENO-CASA'
WHERE id = '78fdcf49-26eb-4d3b-a84d-a631e56a38f2';

DELETE FROM designer_payments
WHERE id = '3d6bc783-1a0c-48f3-b080-811facd34912';
```

---

### 2. Sincronizacao Painel x Tarefas (Pedro/Lucas)
**Problema:** Pedro/Lucas tinha precificacao nos projetos HTR e PREDIO COMERCIAL mas:
- Nao estava como responsavel nos projetos
- Nao tinha tarefas atribuidas

**Solucao:**
```sql
-- Adicionar aos responsaveis
UPDATE projects
SET responsible_ids = array_append(responsible_ids, '7b13b7de-68df-4dde-9263-0e2a72d481b0')
WHERE id IN ('3142ffab-1005-4710-9fb0-e838ba069e97', 'd3e03294-4e54-4279-8e90-474522cec221');

-- Criar tarefas
INSERT INTO tasks (project_id, title, assigned_to, status, phase, priority)
VALUES
('3142ffab-1005-4710-9fb0-e838ba069e97', 'PROJETO HIDROSSANITARIO/DRENAGEM PLUVIAL',
 ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0'], 'PENDENTE', 'EXECUTIVO', 'media'),
('d3e03294-4e54-4279-8e90-474522cec221', 'PROJETO HIDROSSANITARIO',
 ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0'], 'PENDENTE', 'EXECUTIVO', 'media');
```

---

### 3. Correcao RLS - Projetistas sem Acesso aos Projetos
**Problema:** Dados apareciam no preview do Lovable mas nao quando usuario logava.
Causa: Politica RLS so permite ver projetos onde usuario esta em `responsible_ids`.
Projetistas tinham precificacao mas NAO estavam em `responsible_ids`.

**Projetistas afetados (25+ casos):**
| Projetista | Projetos que nao conseguia ver |
|------------|-------------------------------|
| Eloisy | CASA DA MULHER BRASILEIRA, FENIX-COWORKING, LACEN, PREDIO COMERCIAL |
| BESSA | LOTE 02 - TRE-AC |
| Edilson | ESTUDO CENTRAL CELESC, FENIX-COWORKING |
| Igor | DRF-PV |
| Leonardo | ESTUDO CENTRAL CELESC, FENIX-COWORKING |
| Nicolas | GINASIOS |
| Pedro/Lucas | FENIX-COWORKING, LOTE 02 - TRE-AC |
| Philip | FENIX-COWORKING |
| Rondinelly | ACADEMIA, HTR, LOTE 02 - TRE-AC |
| Salomao | CELESC_TUBARAO, HTR, PREDIO COMERCIAL, REFORCO COLEGIO |
| Thiago | FENIX-COWORKING, HTR, LOTE 02 - TRE-AC, PREDIO COMERCIAL |
| Projetista Externo | PRODESP PAISAGISMO |

**Solucao:**
```sql
WITH missing_responsibles AS (
    SELECT DISTINCT pp.project_id, pp.designer_id::text as designer_id_text
    FROM project_pricing pp
    JOIN projects p ON pp.project_id = p.id
    WHERE NOT (pp.designer_id::text = ANY(COALESCE(p.responsible_ids, ARRAY[]::text[])))
)
UPDATE projects p
SET responsible_ids = array_cat(
    COALESCE(p.responsible_ids, ARRAY[]::text[]),
    (SELECT array_agg(DISTINCT mr.designer_id_text)
     FROM missing_responsibles mr
     WHERE mr.project_id = p.id)
)
WHERE p.id IN (SELECT DISTINCT project_id FROM missing_responsibles);
```

---

### 4. Historico de Pagamentos - Formato "PROJETO - CLIENTE"
**Problema:** Pagamentos mostravam apenas nome do projeto (ex: "INCENDIO")
Usuario nao sabia qual cliente era.

**Solucao:**
```sql
UPDATE designer_payments dp
SET project_name = p.name || ' - ' || p.client
FROM projects p
WHERE dp.project_id = p.id
AND p.client IS NOT NULL
AND p.client != '';
```

**Exemplos apos correcao:**
- INCENDIO -> INCENDIO - ZOOBOTANICO
- CASA PABLO -> CASA PABLO - PABLO
- DRF-PV -> DRF-PV - DRV/PV

---

## Politicas RLS Identificadas

### Tabela `projects`:
- Usuarios so veem projetos onde estao em `responsible_ids`
- OU se sao admin
- OU se criaram o projeto

### Tabela `project_pricing`:
- Usuarios so veem precificacoes onde sao o `designer_id`
- OU se sao admin

**IMPORTANTE:** Sempre que adicionar precificacao para um projetista,
garantir que ele tambem esta em `responsible_ids` do projeto!

---

## Verificacao Pos-Correcao

```sql
-- Verificar se ainda existem inconsistencias
SELECT COUNT(*) as casos_pendentes
FROM project_pricing pp
JOIN projects p ON pp.project_id = p.id
WHERE NOT (pp.designer_id::text = ANY(COALESCE(p.responsible_ids, ARRAY[]::text[])));
-- Resultado esperado: 0
```

---

## Melhorias Implementadas (Prevencao Futura)

### 1. Trigger Automatico - Auto-adicionar Projetista ao responsible_ids

Quando uma precificacao e criada, o projetista e automaticamente adicionado
ao `responsible_ids` do projeto. Isso evita o problema de RLS.

```sql
-- Funcao do trigger
CREATE OR REPLACE FUNCTION auto_add_designer_to_responsible_ids()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects
    SET responsible_ids = array_append(
        COALESCE(responsible_ids, ARRAY[]::text[]),
        NEW.designer_id::text
    )
    WHERE id = NEW.project_id
    AND NOT (NEW.designer_id::text = ANY(COALESCE(responsible_ids, ARRAY[]::text[])));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER trigger_auto_add_designer_responsible
    AFTER INSERT ON project_pricing
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_designer_to_responsible_ids();
```

### 2. Funcoes de Monitoramento

#### Verificar inconsistencias:
```sql
SELECT * FROM check_rls_inconsistencies();
```
Retorna lista de projetistas com precificacao mas sem acesso ao projeto.

#### Corrigir automaticamente:
```sql
SELECT fix_rls_inconsistencies();
```
Adiciona projetistas faltantes aos responsible_ids. Retorna quantidade corrigida.

#### Atualizar nomes de pagamentos:
```sql
SELECT fix_payment_project_names();
```
Atualiza pagamentos para formato "PROJETO - CLIENTE".

---

## Resumo Final

| Item | Status |
|------|--------|
| Pagamento duplicado Pedro/Lucas | Corrigido |
| Sincronizacao painel/tarefas | Corrigido |
| RLS - 26 projetistas | Corrigido |
| Historico pagamentos PROJETO-CLIENTE | Corrigido |
| Trigger auto-responsible_ids | Implementado |
| Funcoes de monitoramento | Implementado |

**Proximas precificacoes criadas ja adicionarao automaticamente o projetista aos responsaveis do projeto!**
