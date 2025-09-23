-- ========================================
-- IMPLEMENTAÇÃO CORRIGIDA DO PLANO CRM
-- ========================================

-- ETAPA 1: Adicionar campos necessários se não existirem
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prazo_vigencia DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS restricoes TEXT;

-- ETAPA 2: Limpeza cuidadosa - primeiro verificar referências

-- Limpar tarefas que referenciam projetos de teste
DELETE FROM tasks WHERE project_id IN (
  SELECT id FROM projects 
  WHERE name ILIKE '%teste%' OR name ILIKE '%exemplo%' OR name ILIKE '%sample%'
);

-- Limpar projetos de teste
DELETE FROM projects WHERE name ILIKE '%teste%' OR name ILIKE '%exemplo%' OR name ILIKE '%sample%';

-- Atualizar created_by dos projetos restantes para Igor antes de deletar usuários
UPDATE projects SET created_by = 'cf3a3c2b-8729-405c-9057-8d91fa63ee18' 
WHERE created_by NOT IN (
  SELECT id FROM profiles WHERE email LIKE '%@visaobim.com'
);

-- Remover usuários duplicados (manter apenas @visaobim.com)
DELETE FROM profiles WHERE email LIKE '%@empresa.com' OR email = 'admin@empresa.com';

-- ETAPA 3: Corrigir nomes dos usuários existentes (apenas primeiro nome)
UPDATE profiles SET full_name = 'Igor' WHERE email = 'igor@visaobim.com';
UPDATE profiles SET full_name = 'Stael' WHERE email = 'stael@visaobim.com';
UPDATE profiles SET full_name = 'Gustavo' WHERE email = 'gustavo@visaobim.com';
UPDATE profiles SET full_name = 'Bessa' WHERE email = 'bessa@visaobim.com';
UPDATE profiles SET full_name = 'Leonardo' WHERE email = 'leonardo@visaobim.com';
UPDATE profiles SET full_name = 'Pedro' WHERE email = 'pedro@visaobim.com';
UPDATE profiles SET full_name = 'Thiago' WHERE email = 'thiago@visaobim.com';
UPDATE profiles SET full_name = 'Nicolas' WHERE email = 'nicolas@visaobim.com';
UPDATE profiles SET full_name = 'Eloisy' WHERE email = 'eloisy@visaobim.com';
UPDATE profiles SET full_name = 'Rondinelly' WHERE email = 'rondinelly@visaobim.com';
UPDATE profiles SET full_name = 'Edilson' WHERE email = 'edilson@visaobim.com';
UPDATE profiles SET full_name = 'Philip' WHERE email = 'philip@visaobim.com';
UPDATE profiles SET full_name = 'Nara' WHERE email = 'nara@visaobim.com';
UPDATE profiles SET full_name = 'Projetista Externo' WHERE email = 'externo@visaobim.com';

-- ETAPA 4: Definir papéis corretos (Igor e Stael admin, resto user)
UPDATE profiles SET role = 'admin' WHERE email IN ('igor@visaobim.com', 'stael@visaobim.com');
UPDATE profiles SET role = 'user' WHERE email NOT IN ('igor@visaobim.com', 'stael@visaobim.com');

-- ETAPA 5: Inserir os 19 projetos reais
INSERT INTO projects (name, client, description, status, type, contract_start, contract_end, prazo_vigencia, responsible_ids, created_by) VALUES

-- PROJETO 1: CASA ALTO PADRÃO - BRENO
('CASA ALTO PADRÃO', 'BRENO', 'PROJETOS DE ENGENHARIA E ORÇAMENTO DE CASA DE ALTO PADRÃO', 'EM_ANDAMENTO', 'privado', '2025-03-07', '2025-06-07', NULL, 
 ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb', 'cc32897a-a98d-4319-90c8-15fb63a55665', '994df657-b61d-4b1e-8a59-416051fd5e99', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '7526fbed-99da-4d87-b647-422f278e961b'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 2: CASA ALTO PADRÃO - PABLO
('CASA ALTO PADRÃO', 'PABLO', 'PROJETOS DE ENGENHARIA E ORÇAMENTO DE CASA DE ALTO PADRÃO', 'EM_ANDAMENTO', 'privado', '2025-03-31', '2025-06-30', NULL, 
 ARRAY['905fde13-5c9f-49be-b76a-f76e4ffd124d', 'cc32897a-a98d-4319-90c8-15fb63a55665', '994df657-b61d-4b1e-8a59-416051fd5e99', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '7526fbed-99da-4d87-b647-422f278e961b'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 3: COWORKING - FENIX MOVEIS
('COWORKING', 'FENIX MOVEIS', 'PROJETOS DE ARQUITETURA, ENGENHARIA E ORÇAMENTO DE SALAS COMERCIAIS E COWORKING', 'CONCLUIDO', 'privado', '2025-07-17', '2025-07-17', NULL, 
 ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb', 'cc32897a-a98d-4319-90c8-15fb63a55665', '994df657-b61d-4b1e-8a59-416051fd5e99', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '6fefce39-d90a-4c2a-abf9-80867ac60772'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 4: PORTAL DA ALEGRIA - CARVALHO
('PORTAL DA ALEGRIA', 'CARVALHO', 'PROJETOS DE ARQUITETURA, ENGENHARIA E ORÇAMENTO DE SUPERMERCADO', 'PARALISADO', 'privado', '2025-07-26', '2025-11-26', NULL, 
 ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb', 'cc32897a-a98d-4319-90c8-15fb63a55665', '994df657-b61d-4b1e-8a59-416051fd5e99', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '6fefce39-d90a-4c2a-abf9-80867ac60772', '7526fbed-99da-4d87-b647-422f278e961b', '4c3ce88b-abf9-45cd-a919-954bea79aa0c', '0510e615-438d-400e-886c-fed07c997dc9', '905fde13-5c9f-49be-b76a-f76e4ffd124d'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 5: LAIS E SAROM - THALES
('LAIS E SAROM', 'THALES', 'CONSTRUCAO VIRTUAL E RELATÓRIO DE QUANTITATIVOS PARA CASA DE ALTO PADRAO', 'EM_ANDAMENTO', 'privado', '2024-03-27', '2024-06-27', NULL, 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 6: GILVANDO E ROSANETE - THALES
('GILVANDO E ROSANETE', 'THALES', 'CONSTRUCAO VIRTUAL E RELATÓRIO DE QUANTITATIVOS PARA CASA DE ALTO PADRAO', 'EM_ESPERA', 'privado', NULL, NULL, NULL, 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 7: CLEBER E IGOR - THALES
('CLEBER E IGOR', 'THALES', 'CONSTRUCAO VIRTUAL E RELATÓRIO DE QUANTITATIVOS PARA CASA DE ALTO PADRAO', 'EM_ESPERA', 'privado', NULL, NULL, NULL, 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 8: PARQUE ABERTO - ZOOBOTANICO
('PARQUE ABERTO', 'ZOOBOTANICO', 'AS BUILT E PROJETO DE INCENDIO', 'EM_ANDAMENTO', 'privado', '2025-07-15', '2025-10-15', NULL, 
 ARRAY['905fde13-5c9f-49be-b76a-f76e4ffd124d'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 9: SALAS COMERCIAIS - NORBERTO
('SALAS COMERCIAIS', 'NORBERTO', 'PROJETO ARQUITETÔNICO DE SALAS COMERCIAIS', 'EM_ANDAMENTO', 'privado', '2025-09-17', '2025-11-17', NULL, 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 10: GASES MEDICINAIS - FHEMIG
('GASES MEDICINAIS', 'FHEMIG', 'AS BUILT E PROJETO DE GASES MEDICINAIS MATERNIDADE ODETE VALADARES', 'EM_ANDAMENTO', 'publico', '2025-05-30', '2025-11-30', NULL, 
 ARRAY['4c3ce88b-abf9-45cd-a919-954bea79aa0c'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 11: DELEGACIA POLICIA FEDERAL - SPF/RO
('DELEGACIA POLICIA FEDERAL', 'SPF/RO', 'PROJETOS DA NOVA DELEGACIA DA RECEITA FEDERAL EM VILHENA', 'EM_ANDAMENTO', 'publico', '2025-01-30', '2025-06-30', '2025-06-30', 
 ARRAY['c96e4c49-6b7b-4d89-b56d-f8779271d6e0', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '994df657-b61d-4b1e-8a59-416051fd5e99', '6b1b146d-dc85-4030-9558-52b24c1106cb', 'cc32897a-a98d-4319-90c8-15fb63a55665', '6fefce39-d90a-4c2a-abf9-80867ac60772'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 12: DELEGACIA DA POLICIA RODOVIARIA FEDERAL - SPRF/AL
('DELEGACIA DA POLICIA RODOVIARIA FEDERAL', 'SPRF/AL', 'IMPLANTACAO DA NOVA SEDE DA PRF EM SÃO SEBASTIAO', 'EM_ANDAMENTO', 'publico', '2025-08-04', '2025-08-28', NULL, 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7526fbed-99da-4d87-b647-422f278e961b', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 13: LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR - TRE/AC
('LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR', 'TRE/AC', 'PROJETO DE REFORMA DA NOVA SEDE DE ATENDIMENTO AO ELEITOR', 'EM_ANDAMENTO', 'publico', '2025-06-23', '2025-09-23', NULL, 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 14: AGENCIA DE TUBARAO - CELESC/RS
('AGENCIA DE TUBARAO', 'CELESC/RS', 'PROJETO DE DEMOLICAO E CONSTRUCAO DA NOVA AGENCIA DA CELESC', 'EM_ANDAMENTO', 'publico', '2025-07-09', '2026-01-09', NULL, 
 ARRAY['c96e4c49-6b7b-4d89-b56d-f8779271d6e0', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7526fbed-99da-4d87-b647-422f278e961b', '6b1b146d-dc85-4030-9558-52b24c1106cb', '905fde13-5c9f-49be-b76a-f76e4ffd124d', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '994df657-b61d-4b1e-8a59-416051fd5e99', '6fefce39-d90a-4c2a-abf9-80867ac60772', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 15: GINASIOS - SOP/RS
('GINASIOS', 'SOP/RS', 'PROJETO EXECUTIVO E IMPLANTACAO DE GINASIOS EM ESCOLAS', 'EM_ANDAMENTO', 'publico', '2025-07-24', '2025-10-24', NULL, 
 ARRAY['c96e4c49-6b7b-4d89-b56d-f8779271d6e0', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7526fbed-99da-4d87-b647-422f278e961b', '6b1b146d-dc85-4030-9558-52b24c1106cb', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '994df657-b61d-4b1e-8a59-416051fd5e99', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 16: AGENCIA DA RECEITA FEDERAL - DRV/PV
('AGENCIA DA RECEITA FEDERAL', 'DRV/PV', 'CONSTRUCAO DA NOVA AGENCIA DA RECEITA FEDERAL EM PORTO VELHO', 'EM_ANDAMENTO', 'publico', '2025-03-31', '2025-08-30', NULL, 
 ARRAY['c96e4c49-6b7b-4d89-b56d-f8779271d6e0', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', '7526fbed-99da-4d87-b647-422f278e961b', '6b1b146d-dc85-4030-9558-52b24c1106cb', '7b13b7de-68df-4dde-9263-0e2a72d481b0', '994df657-b61d-4b1e-8a59-416051fd5e99', 'cc32897a-a98d-4319-90c8-15fb63a55665', '905fde13-5c9f-49be-b76a-f76e4ffd124d', '6fefce39-d90a-4c2a-abf9-80867ac60772', '0510e615-438d-400e-886c-fed07c997dc9'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 17: SHOPPING INDEPENDENCIA - PREF. SANTA MARIA/RS
('SHOPPING INDEPENDENCIA', 'PREF. SANTA MARIA/RS', 'REFORMA DAS COBERTURAS DO SHOPPING INDEPENDENCIA', 'EM_ANDAMENTO', 'publico', '2025-03-15', '2025-04-30', '2025-06-15', 
 ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 18: CAMPUS CURITIBA - UNESPAR/PR
('CAMPUS CURITIBA', 'UNESPAR/PR', 'REFORMA DO CAMPUS CURITIBA NO', 'EM_ANDAMENTO', 'publico', '2025-01-06', '2025-04-06', '2025-12-06', 
 ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb', '994df657-b61d-4b1e-8a59-416051fd5e99', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18'),

-- PROJETO 19: REFORMA DAS COBERTURAS PREFEITURA - PREF.LORENA/SP
('REFORMA DAS COBERTURAS PREFEITURA', 'PREF.LORENA/SP', 'PROJETO DE REFORMA DAS COBERTURAS DA SEDE DA PREFEITURA DE LORENA SP', 'CONCLUIDO', 'publico', NULL, NULL, NULL, 
 ARRAY['cf3a3c2b-8729-405c-9057-8d91fa63ee18'], 
 'cf3a3c2b-8729-405c-9057-8d91fa63ee18');