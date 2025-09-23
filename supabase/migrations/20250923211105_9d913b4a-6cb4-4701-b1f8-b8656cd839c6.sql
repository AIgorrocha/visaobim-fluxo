-- ========================================
-- INSERÇÃO CORRIGIDA DAS TAREFAS (LOTE 1 - CORRIGIDO)
-- ========================================

-- TAREFAS PROJETO 1: CASA ALTO PADRÃO - BRENO
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'REVISAO HIDROSSANITÁRIO', p.id, ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0'], 'EXECUTIVO', 'EM_ANDAMENTO', '2025-09-15', '2025-09-24', NULL, '', ''
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'BRENO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'APRESENTACAO PROJETOS VIA DALUX', p.id, ARRAY['cf3a3c2b-8729-405c-9057-8d91fa63ee18', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', '2025-09-04', '2025-10-03', NULL, '', 'VERIFICAR COM EDILSON MODELO FEDERADO ANTES DA APRESENTAÇÃO NO DALUX.'
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'BRENO';

-- TAREFAS PROJETO 2: CASA ALTO PADRÃO - PABLO
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ESTRUTURAL', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'EM_ANDAMENTO', '2025-07-15', '2025-08-15', NULL, '', ''
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ELÉTRICO BAIXA TENSÃO', p.id, ARRAY['994df657-b61d-4b1e-8a59-416051fd5e99'], 'EXECUTIVO', 'PARALISADA', NULL, NULL, NULL, 'ARQUITETURA', 'AGUARDANDO LUMINOTÉCNICO'
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO HIDROSSANITÁRIO', p.id, ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0'], 'EXECUTIVO', 'CONCLUIDA', '2025-07-15', '2025-08-15', '2025-07-30', 'ARQUITETURA', 'AGUARDANDO LUMINOTÉCNICO'
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO CLIMATIZAÇÃO', p.id, ARRAY['905fde13-5c9f-49be-b76a-f76e4ffd124d'], 'EXECUTIVO', 'CONCLUIDA', '2025-07-15', '2025-08-15', NULL, '', ''
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'CONSTRUÇÃO VIRTUAL ARQUITETURA', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91'], 'EXECUTIVO', 'PENDENTE', '2025-07-15', '2025-08-15', NULL, '', ''
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'COMPATIBILIZACAO E RELATORIO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', NULL, NULL, NULL, 'CONSTRUÇÃO VIRTUAL,ARQUITETURA,METALICA,CONCRETO,HIDROSSANITARIO,CLIMATIZACAO', ''
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ORCAMENTO EXECUTIVO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', NULL, NULL, NULL, 'CONSTRUÇÃO VIRTUAL,ARQUITETURA,METALICA,CONCRETO,HIDROSSANITARIO,CLIMATIZACAO', ''
FROM projects p WHERE p.name = 'CASA ALTO PADRÃO' AND p.client = 'PABLO';

-- TAREFAS PROJETO 3: COWORKING - FENIX MOVEIS
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'APRESENTACAO PROJETOS VIA DALUX', p.id, ARRAY['cf3a3c2b-8729-405c-9057-8d91fa63ee18', 'cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', '2025-09-04', '2025-10-03', NULL, '', 'VERIFICAR COM EDILSON MODELO FEDERADO ANTES DA APRESENTAÇÃO NO DALUX.'
FROM projects p WHERE p.name = 'COWORKING' AND p.client = 'FENIX MOVEIS';

-- TAREFAS PROJETO 4: PORTAL DA ALEGRIA - CARVALHO
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PRÉ-DIMENSIONAMENTO E PROJETO BASICO ESTRUTURAL', p.id, ARRAY['6fefce39-d90a-4c2a-abf9-80867ac60772', '7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'PARALISADA', NULL, NULL, NULL, 'ARQUITETURA', 'APROVACAO DO LAYOUT ARQUITETONICO PELO DIRETOR DO CARVALHO.'
FROM projects p WHERE p.name = 'PORTAL DA ALEGRIA' AND p.client = 'CARVALHO';

-- TAREFAS PROJETO 5: LAIS E SAROM - THALES
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'RELATORIO DE QUANTITATIVOS', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'EM_ANDAMENTO', '2025-09-17', '2025-09-29', NULL, '', 'USAR ESTRUTURA E INSTRUCOES NO CHAT DO CLAUDE, FORNECIDO O LINK.'
FROM projects p WHERE p.name = 'LAIS E SAROM' AND p.client = 'THALES';

-- TAREFAS PROJETO 6: GILVANDO E ROSANETE - THALES
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'RELATORIO DE QUANTITATIVOS', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', NULL, NULL, NULL, 'CONSTRUCAO VIRTUAL', 'MESMO RELATORIO LAIS E SAROM'
FROM projects p WHERE p.name = 'GILVANDO E ROSANETE' AND p.client = 'THALES';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'CONSTRUCAO VIRTUAL', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'b639705e-c87a-4e3d-bee2-d564e4dc5a9c'], 'EXECUTIVO', 'PENDENTE', NULL, NULL, NULL, 'CONSTRUCAO VIRTUAL', 'MESMO RELATORIO LAIS E SAROM'
FROM projects p WHERE p.name = 'GILVANDO E ROSANETE' AND p.client = 'THALES';

-- TAREFAS PROJETO 7: CLEBER E IGOR - THALES
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'CONSTRUCAO VIRTUAL', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'b639705e-c87a-4e3d-bee2-d564e4dc5a9c'], 'EXECUTIVO', 'PENDENTE', '2025-07-15', '2025-09-15', NULL, '', ''
FROM projects p WHERE p.name = 'CLEBER E IGOR' AND p.client = 'THALES';

-- TAREFAS PROJETO 8: PARQUE ABERTO - ZOOBOTANICO
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'AS BUILT E PROJETO DE INCENDIO', p.id, ARRAY['905fde13-5c9f-49be-b76a-f76e4ffd124d'], 'EXECUTIVO', 'EM_ANDAMENTO', '2025-07-15', '2025-09-15', NULL, '', 'AGUARDANDO RESPOSTA FABIO E CAMPELO NETO SOBRE REUNIAO BOMBEIROS.'
FROM projects p WHERE p.name = 'PARQUE ABERTO' AND p.client = 'ZOOBOTANICO';

-- TAREFAS PROJETO 9: SALAS COMERCIAIS - NORBERTO (CORRIGIDO PHASE)
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'LAYOUT ARQUITETONICO', p.id, ARRAY['c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 'ESTUDO_PRELIMINAR', 'PENDENTE', '2025-09-15', '2025-11-15', NULL, '', ''
FROM projects p WHERE p.name = 'SALAS COMERCIAIS' AND p.client = 'NORBERTO';

-- TAREFAS PROJETO 10: GASES MEDICINAIS - FHEMIG
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ETAPA 01 (AS BUILT E DEMANDA-ARQ E GASES)', p.id, ARRAY['4c3ce88b-abf9-45cd-a919-954bea79aa0c'], 'PROJETO_BASICO', 'CONCLUIDA', '2025-05-30', '2025-09-30', '2025-09-18', '', 'AGENDAMENTO DE REUNIAO E PRAZOS PARA PROJETO EXECUTIVO (ETAPA 2)'
FROM projects p WHERE p.name = 'GASES MEDICINAIS' AND p.client = 'FHEMIG';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ETAPA 2', p.id, ARRAY['4c3ce88b-abf9-45cd-a919-954bea79aa0c'], 'PROJETO_BASICO', 'CONCLUIDA', '2025-09-19', NULL, NULL, '', ''
FROM projects p WHERE p.name = 'GASES MEDICINAIS' AND p.client = 'FHEMIG';