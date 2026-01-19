-- ========================================
-- IMPORTACAO DE DADOS DE PAGAMENTOS
-- Script para importar pagamentos historicos dos CSVs
-- ========================================

-- Este script deve ser executado DEPOIS da migracao 20260119_create_financial_tables.sql

-- ========================================
-- MAPEAMENTO DE PROJETISTAS (nome CSV -> email sistema)
-- ========================================
-- NARA -> nara@visaobim.com
-- GUSTAVO -> gustavo@visaobim.com
-- PEDRO/LUCAS -> pedro@visaobim.com (todos para Pedro conforme decisao)
-- LEONARDO -> leonardo@visaobim.com
-- RONDINELLY -> rondinelly@visaobim.com
-- PHILIP -> philip@visaobim.com
-- THIAGO -> thiago@visaobim.com
-- EDISON/EDILSON -> edilson@visaobim.com
-- ELOISY -> eloisy@visaobim.com
-- FERNANDO -> fernando@visaobim.com
-- SALOMAO -> salomao@visaobim.com
-- BESSA -> bessa@visaobim.com
-- FABIO -> fabio@visaobim.com
-- IGOR -> igor@visaobim.com
-- ARTHUR -> arthur@visaobim.com
-- PROJETISTA EXTERNO -> externo@visaobim.com
-- NICOLAS -> nicolas@visaobim.com
-- LISBOA -> lisboa@visaobim.com
-- STAEL -> stael@visaobim.com

-- ========================================
-- FUNCAO AUXILIAR PARA BUSCAR ID DO PROJETISTA
-- ========================================
CREATE OR REPLACE FUNCTION get_designer_id_by_name(designer_name TEXT)
RETURNS UUID AS $$
DECLARE
  designer_id UUID;
  normalized_name TEXT;
BEGIN
  -- Normalizar o nome (remover espacos, uppercase)
  normalized_name := UPPER(TRIM(designer_name));

  -- Buscar pelo nome normalizado
  SELECT id INTO designer_id FROM profiles WHERE
    UPPER(full_name) LIKE '%' || normalized_name || '%'
    OR (normalized_name = 'PEDRO/LUCAS' AND email = 'pedro@visaobim.com')
    OR (normalized_name = 'EDISON' AND email = 'edilson@visaobim.com')
    OR (normalized_name = 'EDILSON' AND email = 'edilson@visaobim.com')
    OR (normalized_name = 'PROJETISTA EXTERNO' AND email = 'externo@visaobim.com')
  LIMIT 1;

  RETURN designer_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- EXEMPLO: INSERIR PAGAMENTOS DO SETOR PRIVADO
-- Os dados reais devem ser inseridos via interface ou script externo
-- ========================================

-- Exemplo de estrutura para importacao:
-- INSERT INTO designer_payments (designer_id, discipline, amount, payment_date, project_name, sector, status)
-- SELECT
--   get_designer_id_by_name('NARA'),
--   'ESTRUTURAL',
--   1500.00,
--   '2024-01-15',
--   'SERVFAZ-AGROPARQUE',
--   'privado',
--   'pago';

-- ========================================
-- CRIAR PROJETOS FALTANTES COMO FINALIZADOS
-- ========================================

-- Funcao para criar projeto se nao existir
CREATE OR REPLACE FUNCTION create_project_if_not_exists(
  p_name TEXT,
  p_client TEXT,
  p_type TEXT DEFAULT 'privado'
)
RETURNS UUID AS $$
DECLARE
  project_id UUID;
  admin_id UUID;
BEGIN
  -- Verificar se projeto existe
  SELECT id INTO project_id FROM projects WHERE name = p_name LIMIT 1;

  IF project_id IS NULL THEN
    -- Buscar um admin para created_by
    SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;

    -- Criar o projeto como FINALIZADO
    INSERT INTO projects (
      name,
      client,
      type,
      status,
      description,
      responsible_ids,
      contract_start,
      contract_end,
      created_by,
      is_archived
    ) VALUES (
      p_name,
      p_client,
      p_type,
      'FINALIZADO',
      'Projeto importado de dados historicos',
      ARRAY[]::UUID[],
      CURRENT_DATE - INTERVAL '1 year',
      CURRENT_DATE,
      admin_id,
      true  -- Arquivado pois e historico
    )
    RETURNING id INTO project_id;
  END IF;

  RETURN project_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CRIAR PROJETOS FALTANTES (SETOR PRIVADO)
-- ========================================

-- BRENO-CASA
SELECT create_project_if_not_exists('BRENO-CASA', 'Breno', 'privado');

-- FENIX-COWORKING
SELECT create_project_if_not_exists('FENIX-COWORKING', 'Fenix', 'privado');

-- THALES-GILVANDO&CARINE
SELECT create_project_if_not_exists('THALES-GILVANDO&CARINE', 'Thales', 'privado');

-- THALES-CLEBER&IGOR
SELECT create_project_if_not_exists('THALES-CLEBER&IGOR', 'Thales', 'privado');

-- IRIS-REFORCO EST
SELECT create_project_if_not_exists('IRIS-REFORCO EST', 'Iris', 'privado');

-- ZOOBOTANICO-CASA
SELECT create_project_if_not_exists('ZOOBOTANICO-CASA', 'Zoobotanico', 'privado');

-- ========================================
-- CRIAR PROJETOS FALTANTES (SETOR PUBLICO)
-- ========================================

-- SPRF-AL
SELECT create_project_if_not_exists('SPRF-AL', 'PRF Rio Largo/AL', 'publico');

-- CIAP-SP
SELECT create_project_if_not_exists('CIAP-SP', 'CIAP/SP', 'publico');

-- FHEMIG-BH
SELECT create_project_if_not_exists('FHEMIG-BH', 'FHEMIG/MG', 'publico');

-- SPF-RO
SELECT create_project_if_not_exists('SPF-RO', 'SPF/RO - Policia Federal', 'publico');

-- IBC-RJ
SELECT create_project_if_not_exists('IBC-RJ', 'IBC/RJ', 'publico');

-- ZOOTECNIA-USP
SELECT create_project_if_not_exists('ZOOTECNIA-USP', 'USP', 'publico');

-- ========================================
-- COMENTARIOS PARA IMPORTACAO MANUAL
-- ========================================

-- Para importar os dados dos CSVs:
-- 1. Os dados devem ser convertidos para SQL INSERT
-- 2. Usar a funcao get_designer_id_by_name() para mapear nomes
-- 3. O campo project_name pode ser preenchido manualmente
-- 4. Se o projeto existir no sistema, usar project_id; senao, apenas project_name

-- Exemplo de importacao em lote (descomente e adapte):
/*
INSERT INTO designer_payments (designer_id, discipline, amount, payment_date, project_name, sector, status, description)
VALUES
  -- Pagamentos do setor privado
  (get_designer_id_by_name('NARA'), 'ESTRUTURAL', 1500.00, '2024-01-15', 'SERVFAZ-AGROPARQUE', 'privado', 'pago', 'Pagamento parcial'),
  (get_designer_id_by_name('GUSTAVO'), 'ELETRICO', 2000.00, '2024-02-20', 'THALES-LAIS&SAROM', 'privado', 'pago', 'Pagamento completo'),
  -- ... mais pagamentos
;
*/

-- ========================================
-- LIMPAR FUNCOES AUXILIARES (OPCIONAL)
-- ========================================
-- Se desejar remover as funcoes apos uso:
-- DROP FUNCTION IF EXISTS get_designer_id_by_name(TEXT);
-- DROP FUNCTION IF EXISTS create_project_if_not_exists(TEXT, TEXT, TEXT);
