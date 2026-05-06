-- ========================================
-- INSERÇÃO DE PAGAMENTOS FALTANTES
-- Data: 20/01/2026
-- ========================================

-- ========================================
-- 1. CRIAR PROJETO SERVFAZ-AGROPARQUE (se não existir)
-- ========================================

-- Verificar se existe
-- SELECT * FROM projects WHERE name ILIKE '%AGROPARQUE%' OR name ILIKE '%SERVFAZ%';

-- Criar o projeto se não existir
INSERT INTO projects (name, client, type, status, project_value, description, created_by)
SELECT
  'SERVFAZ-AGROPARQUE',
  'AGROPARQUE',
  'privado',
  'EM_ANDAMENTO',
  113233.29,
  'Projeto SERVFAZ Agroparque - Valor: R$ 113.233,29',
  (SELECT id FROM profiles WHERE email = 'igor@visaobim.com' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE name ILIKE '%AGROPARQUE%' OR name ILIKE '%SERVFAZ%'
);

-- Se já existir, atualizar o valor
UPDATE projects
SET project_value = 113233.29,
    status = CASE WHEN status = 'EM_ESPERA' THEN 'EM_ANDAMENTO' ELSE status END
WHERE (name ILIKE '%AGROPARQUE%' OR name ILIKE '%SERVFAZ%')
  AND (project_value IS NULL OR project_value = 0);

-- ========================================
-- 2. INSERIR RECEBIMENTOS ACADEMIA (WILLIAM)
-- ========================================

-- Pagamento de 05/11/2025 - R$ 6.800,00
INSERT INTO contract_income (project_id, amount, income_date, description, income_type)
SELECT
  (SELECT id FROM projects WHERE name ILIKE '%ACADEMIA%' LIMIT 1),
  6800.00,
  '2025-11-05',
  'Pagamento WILLIAM - Academia',
  'parcela'
WHERE NOT EXISTS (
  SELECT 1 FROM contract_income
  WHERE project_id = (SELECT id FROM projects WHERE name ILIKE '%ACADEMIA%' LIMIT 1)
    AND income_date = '2025-11-05'
    AND amount = 6800.00
);

-- ========================================
-- 3. INSERIR RECEBIMENTOS TALISMA-ESCOLA
-- ========================================

-- Verificar se o pagamento de 42.871,95 já existe (estava documentado antes)
-- Se não existir, inserir:
INSERT INTO contract_income (project_id, amount, income_date, description, income_type)
SELECT
  (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1),
  42871.95,
  '2025-12-20',
  'Pagamento parcial TALISMA-ESCOLA',
  'parcela'
WHERE NOT EXISTS (
  SELECT 1 FROM contract_income
  WHERE project_id = (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1)
    AND income_date = '2025-12-20'
    AND amount = 42871.95
);

-- Pagamento de 23/12/2025 - R$ 8.000,00
INSERT INTO contract_income (project_id, amount, income_date, description, income_type)
SELECT
  (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1),
  8000.00,
  '2025-12-23',
  'Pagamento parcial TALISMA-ESCOLA',
  'parcela'
WHERE NOT EXISTS (
  SELECT 1 FROM contract_income
  WHERE project_id = (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1)
    AND income_date = '2025-12-23'
    AND amount = 8000.00
);

-- Pagamento de 05/01/2026 - R$ 2.750,00
INSERT INTO contract_income (project_id, amount, income_date, description, income_type)
SELECT
  (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1),
  2750.00,
  '2026-01-05',
  'Pagamento parcial TALISMA-ESCOLA',
  'parcela'
WHERE NOT EXISTS (
  SELECT 1 FROM contract_income
  WHERE project_id = (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1)
    AND income_date = '2026-01-05'
    AND amount = 2750.00
);

-- Pagamento de 12/01/2026 - R$ 2.750,00
INSERT INTO contract_income (project_id, amount, income_date, description, income_type)
SELECT
  (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1),
  2750.00,
  '2026-01-12',
  'Pagamento parcial TALISMA-ESCOLA',
  'parcela'
WHERE NOT EXISTS (
  SELECT 1 FROM contract_income
  WHERE project_id = (SELECT id FROM projects WHERE name ILIKE '%TALISMA%' LIMIT 1)
    AND income_date = '2026-01-12'
    AND amount = 2750.00
);

-- ========================================
-- 4. VERIFICAÇÃO
-- ========================================

-- Verificar projeto AGROPARQUE
-- SELECT * FROM projects WHERE name ILIKE '%AGROPARQUE%' OR name ILIKE '%SERVFAZ%';

-- Verificar recebimentos ACADEMIA
-- SELECT * FROM contract_income WHERE project_id IN (SELECT id FROM projects WHERE name ILIKE '%ACADEMIA%');

-- Verificar recebimentos TALISMA
-- SELECT * FROM contract_income WHERE project_id IN (SELECT id FROM projects WHERE name ILIKE '%TALISMA%');

-- ========================================
-- RESUMO DOS PAGAMENTOS INSERIDOS:
-- ========================================
-- ACADEMIA:
--   05/11/2025: R$ 6.800,00
--   Total: R$ 6.800,00
--   Valor do contrato: R$ 20.500,00
--   A receber: R$ 13.700,00
--
-- TALISMA-ESCOLA:
--   20/12/2025: R$ 42.871,95
--   23/12/2025: R$ 8.000,00
--   05/01/2026: R$ 2.750,00
--   12/01/2026: R$ 2.750,00
--   Total: R$ 56.371,95
--   Valor do contrato: R$ 139.950,00
--   A receber: R$ 83.578,05
--
-- SERVFAZ-AGROPARQUE:
--   Valor do contrato: R$ 113.233,29
--   Recebido: R$ 0,00 (adicionar quando houver pagamentos)
-- ========================================
