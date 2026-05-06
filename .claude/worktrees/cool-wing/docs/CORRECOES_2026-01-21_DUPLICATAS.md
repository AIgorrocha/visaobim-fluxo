# Correções 21/01/2026 - Duplicatas e Valores Errados

## Resumo
- **Data:** 21/01/2026
- **Tabela afetada:** designer_payments
- **Problema:** 16 registros duplicados + 2 valores incorretos
- **Valor duplicado removido:** R$ 10.250,00

---

## PARTE 1: Registros Duplicados DELETADOS

Cada lançamento estava inserido 2x - uma com nome curto e outra com nome completo.
Mantivemos os registros com nome CURTO e deletamos os com nome longo.

### IDs Deletados:

| # | ID Deletado | Data | Valor | Descrição | Projeto (deletado) |
|---|-------------|------|-------|-----------|-------------------|
| 1 | `53bb1bd9-597d-4cd8-8f0f-df9ff2f14385` | 17/06/2025 | R$ 200 | MODELAGEM BASICA | BRENO-CASA - Breno |
| 2 | `1cd17d01-4c04-475f-a010-ce4bbb4be5c0` | 01/07/2025 | R$ 600 | CONSTRUÇÃO VIRTUAL | BRENO-CASA - Breno |
| 3 | `033ef5dc-7683-402c-8913-bae77aae5e18` | 01/07/2025 | R$ 2.000 | ESTRUTURAS | BRENO-CASA - Breno |
| 4 | `d4e79d29-95b8-4394-ab0a-1ab67df9e7ad` | 15/07/2025 | R$ 500 | CONSTRUÇÃO VIRTUAL | BRENO-CASA - Breno |
| 5 | `51c94ad5-a6aa-428f-989d-a329ea4a3b91` | 15/07/2025 | R$ 800 | ESTRUTURAS | BRENO-CASA - Breno |
| 6 | `47a8edcc-4b8c-4dbd-80f4-c6b872f8e6fd` | 17/08/2025 | R$ 1.000 | ELETRICA | BRENO-CASA - Breno |
| 7 | `caca7b38-81df-4243-b79e-f65b320fcb4b` | 29/08/2025 | R$ 600 | CONSTRUÇÃO VIRTUAL | BRENO-CASA - Breno |
| 8 | `482bd801-68c8-49f1-bfaf-110412433004` | 29/09/2025 | R$ 400 | ELETRICA | BRENO-CASA - Breno |
| 9 | `af12b243-2f2e-46d1-9e01-e478861a8e35` | 30/10/2025 | R$ 1.300 | CONSTRUÇÃO VIRTUAL | THALES-GILVANDO&CARINE - Gilvando e Carine |
| 10 | `2855d374-2845-4b08-92ca-8bf8cd436c2c` | 30/10/2025 | R$ 600 | CONSTRUÇÃO VIRTUAL | LAIS E SAROM - THALES |
| 11 | `69f4f167-6276-4d13-9cec-b0ddc1876dbe` | 03/12/2025 | R$ 150 | RELATORIO | THALES-CLEBER&IGOR - Cleber e Igor |
| 12 | `89b3bd77-123b-4c16-b4a1-dce85b2b0faf` | 03/12/2025 | R$ 150 | RELATORIO QTD | THALES-GILVANDO&CARINE - Gilvando e Carine |
| 13 | `f764dc49-f6f9-4de3-9af2-51cb4c68ee09` | 05/12/2025 | R$ 1.150 | Construcao virtual | ROSANETE E ESEQUIAS - THALES |
| 14 | `fca3626a-4805-48eb-a2eb-e37a508a165d` | 16/12/2025 | R$ 100 | BOLSA ESTAGIO NARA DEZEMBRO | ROSANETE E ESEQUIAS - THALES |
| 15 | `a1621476-76ed-43fd-99a0-828c6899f0e1` | 16/12/2025 | R$ 150 | BOLSA ESTAGIO NARA DEZEMBRO | BRENO-CASA - Breno |
| 16 | `17c6bd9f-a3e0-4cf2-ae5f-a92bd5a4e7dd` | 16/12/2025 | R$ 1.500 | ESTRUTURA ATELIER SALOMAO | IRIS-REFORCO EST - Iris |

### SQL Executado:
```sql
DELETE FROM designer_payments
WHERE id IN (
  '53bb1bd9-597d-4cd8-8f0f-df9ff2f14385',
  '1cd17d01-4c04-475f-a010-ce4bbb4be5c0',
  '033ef5dc-7683-402c-8913-bae77aae5e18',
  'd4e79d29-95b8-4394-ab0a-1ab67df9e7ad',
  '51c94ad5-a6aa-428f-989d-a329ea4a3b91',
  '47a8edcc-4b8c-4dbd-80f4-c6b872f8e6fd',
  'caca7b38-81df-4243-b79e-f65b320fcb4b',
  '482bd801-68c8-49f1-bfaf-110412433004',
  'af12b243-2f2e-46d1-9e01-e478861a8e35',
  '2855d374-2845-4b08-92ca-8bf8cd436c2c',
  '69f4f167-6276-4d13-9cec-b0ddc1876dbe',
  '89b3bd77-123b-4c16-b4a1-dce85b2b0faf',
  'f764dc49-f6f9-4de3-9af2-51cb4c68ee09',
  'fca3626a-4805-48eb-a2eb-e37a508a165d',
  'a1621476-76ed-43fd-99a0-828c6899f0e1',
  '17c6bd9f-a3e0-4cf2-ae5f-a92bd5a4e7dd'
);
```

---

## PARTE 2: Valores CORRIGIDOS (R$ 125 → R$ 250)

| ID | Projeto | Descrição | Valor ANTES | Valor DEPOIS |
|----|---------|-----------|-------------|--------------|
| `f8b18d14-d8ef-43bf-bb0e-d79074c1ce11` | NORBERTO-SALAS COMERCIAIS | BOLSA ESTAGIO ARTHUR | R$ 125 | R$ 250 |
| `4c13fb32-5208-4634-a894-528fc162bcc3` | ZOOBOTANICO-PARQUE AQUATICO | BOLSA ESTAGIO ARTHUR | R$ 125 | R$ 250 |

### SQL Executado:
```sql
UPDATE designer_payments
SET amount = 250
WHERE id IN (
  'f8b18d14-d8ef-43bf-bb0e-d79074c1ce11',
  '4c13fb32-5208-4634-a894-528fc162bcc3'
);
```

---

## Verificação Pós-Correção

### Conferir se duplicatas foram removidas:
```sql
SELECT amount, payment_date, description, COUNT(*) as qtd
FROM designer_payments
WHERE sector = 'privado'
GROUP BY amount, payment_date, description
HAVING COUNT(*) > 1;
-- Esperado: Apenas os R$ 250 de projetos diferentes (ANDRE LOSS e BRENO-CASA)
```

### Conferir valores corrigidos:
```sql
SELECT id, project_name, amount, description
FROM designer_payments
WHERE id IN (
  'f8b18d14-d8ef-43bf-bb0e-d79074c1ce11',
  '4c13fb32-5208-4634-a894-528fc162bcc3'
);
-- Esperado: amount = 250 para ambos
```

---

## PARTE 3: Mais Duplicatas Encontradas e Corrigidas

Após a primeira correção, identificamos mais 2 registros duplicados de R$ 125:

| # | ID Deletado | Data | Valor | Descrição | Projeto |
|---|-------------|------|-------|-----------|---------|
| 17 | `301ad848-2444-4505-91aa-5e34c11cfe56` | 05/01/2026 | R$ 125 | BOLSA ESTAGIO ARTHUR | NORBERTO-SALAS COMERCIAIS |
| 18 | `c74a688b-9aab-4e5e-992e-e88f327dd620` | 05/01/2026 | R$ 125 | BOLSA ESTAGIO ARTHUR | ZOOBOTANICO-PARQUE AQUATICO |

### SQL Executado:
```sql
-- Deletar duplicatas de R$ 125
DELETE FROM designer_payments
WHERE id IN (
  '301ad848-2444-4505-91aa-5e34c11cfe56',
  'c74a688b-9aab-4e5e-992e-e88f327dd620'
);

-- Adicionar descrição nos registros de R$ 250 que estavam sem
UPDATE designer_payments
SET description = 'BOLSA ESTAGIO ARTHUR'
WHERE id IN (
  'f8b18d14-d8ef-43bf-bb0e-d79074c1ce11',
  '4c13fb32-5208-4634-a894-528fc162bcc3'
);
```

---

## Resumo Final

| Ação | Quantidade | Valor Total Corrigido |
|------|------------|----------------------|
| Registros duplicados deletados | 18 | R$ 10.500,00 |
| Valores corrigidos (R$ 125 → R$ 250) | 2 | +R$ 250,00 |

### Situação Final:
- **Total de registros PRIVADO:** 49
- **Valor total PRIVADO:** R$ 69.850,00

### Registros que PARECEM duplicatas mas são CORRETOS:
| Data | Valor | Descrição | Projetos |
|------|-------|-----------|----------|
| 05/01/2026 | R$ 250 | BOLSA ESTAGIO ARTHUR | NORBERTO + ZOOBOTANICO |
| 19/01/2026 | R$ 250 | BOLSA ESTAGIO NARA | ANDRE LOSS + BRENO-CASA |

**Motivo:** São lançamentos legítimos - a mesma pessoa recebeu por trabalhos em 2 projetos diferentes.

---

**Status:** ✅ Todas as correções aplicadas em 21/01/2026
