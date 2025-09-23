-- ========================================
-- INSERÇÃO DAS TAREFAS FINAIS - PROJETOS 16-19 (LOTE 3)
-- ========================================

-- TAREFAS PROJETO 16: AGENCIA DA RECEITA FEDERAL - DRV/PV (10 tarefas)
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ARQUITETONICO, ACESSIBILIDADE, PAISAGISMO, SINALIZACAO E COMUNICAO VISUAL', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 'EXECUTIVO', 'PENDENTE', '2025-08-30', '2025-10-19', NULL, '', ''
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'LAYOUT ARQUITETONICO', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 'ESTUDO_PRELIMINAR', 'CONCLUIDA', '2025-04-30', '2025-05-30', '2025-08-01', '', 'NO DIA 07 DE AGOSTO, PERGUNTEI SOBRE APROVACAO DOS PROJETOS PRIMEIRA ETAPA, DIA 19 AGOSTO FOI QUESTIONADO SOBRE AS PONTUACOES DA FACHADA, DIA 12 DE SETEMBRO FORAM ENVIADOS DIVERSOS PROJETOS DE ENGENHARIA, RETONARAM ATE DIA DE HOJE 22.09 APENAS OS APONTAMENTOS DO SPDA E ELETRICO.'
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ESTRUTURAL E FUNDACOES', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b', 'b639705e-c87a-4e3d-bee2-d564e4dc5a9c'], 'EXECUTIVO', 'EM_ANDAMENTO', '2025-08-30', '2025-10-19', NULL, '', ''
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO HIDROSSANITARIO', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'EM_ESPERA', '2025-08-30', '2025-10-19', '2025-09-12', '', 'AGUARDANDO APONTAMENTOS DA FISCALIZACAO'
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO LUMINOTECNICO, ELETRICO BAIXA TENSAO, CABEAMENTOS, CFTV, REDE LOGICA, TELECOMUNICACOES, SONORIZACAO, CONTROLE DE ACESSO, ENERGIA ESTABILIZADA', p.id, ARRAY['994df657-b61d-4b1e-8a59-416051fd5e99'], 'EXECUTIVO', 'EM_ANDAMENTO', '2025-08-30', '2025-10-19', '2025-09-19', '', 'AJUSTES REALIZADOS PELO THIAGO E VAMOS ABORDAR NA REUNIAO'
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ENTRADA DE ENERGIA, SUBESTACAO AEREA EM POSTE, GRUPO GERADOR, FOTOVOLTAICA', p.id, ARRAY['0510e615-438d-400e-886c-fed07c997dc9'], 'EXECUTIVO', 'PARALISADA', NULL, '2025-10-19', '2025-09-19', '', 'AJUSTAR URGENTE COM THIAGO PRA INICIAR PROJETOS FOTOVOLTAICOS, GERADOR E SUBESTACAO, ALINHAR PRA INICIO'
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO DE CLIMATIZACAO', p.id, ARRAY['905fde13-5c9f-49be-b76a-f76e4ffd124d'], 'EXECUTIVO', 'EM_ESPERA', NULL, '2025-10-19', '2025-09-12', '', 'AGUARDANDO RESPOSTA FISCALIZACAO.'
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO CANTEIRO DE OBRA', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'EM_ANDAMENTO', NULL, '2025-10-19', NULL, '', ''
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO TERRAPLENAGEM', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91'], 'EXECUTIVO', 'EM_ANDAMENTO', NULL, '2025-10-19', NULL, '', ''
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'COMPATIBILIZACAO, AJUSTES E ORCAMENTO EXECUTIVO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'EM_ANDAMENTO', NULL, '2025-10-30', NULL, '', 'NECESSARIO IR MONTANDO EAP PRA APRESENTAR PRO ORGAO, E COMO VAMOS FAZER A ASSOCIACAO, JA POSSO ADQURIR O ORCABIM (QND INICIAR)'
FROM projects p WHERE p.name = 'AGENCIA DA RECEITA FEDERAL' AND p.client = 'DRV/PV';

-- TAREFAS PROJETO 17: SHOPPING INDEPENDENCIA - PREF. SANTA MARIA/RS
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO DE SEGURANCA, BASICO ARQUITETONICO E ORCAMENTO', p.id, ARRAY['cf3a3c2b-8729-405c-9057-8d91fa63ee18', 'cc32897a-a98d-4319-90c8-15fb63a55665', '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91'], 'EXECUTIVO', 'CONCLUIDA', NULL, NULL, '2025-07-31', '', 'AGUARDANDO FISCALIZACAO ENVIAR ANALISE.'
FROM projects p WHERE p.name = 'SHOPPING INDEPENDENCIA' AND p.client = 'PREF. SANTA MARIA/RS';

-- TAREFAS PROJETO 18: CAMPUS CURITIBA - UNESPAR/PR
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'APROVACAO PROJETO DE INCENDIO NO CORPO DE BOMBEIROS', p.id, ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb'], 'EXECUTIVO', 'EM_ESPERA', NULL, NULL, '2025-09-15', '', 'AGUARDANDO ANALISE CORPO DE BOMBEIROS'
FROM projects p WHERE p.name = 'CAMPUS CURITIBA' AND p.client = 'UNESPAR/PR';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ORCAMENTO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'EM_ESPERA', NULL, NULL, '2025-09-08', '', ''
FROM projects p WHERE p.name = 'CAMPUS CURITIBA' AND p.client = 'UNESPAR/PR';

-- TAREFAS PROJETO 19: REFORMA DAS COBERTURAS PREFEITURA - PREF.LORENA/SP
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'AGUARDANDO LICITAR OBRA PRA FISCALIZACAO', p.id, ARRAY['cf3a3c2b-8729-405c-9057-8d91fa63ee18'], 'EXECUTIVO', 'PARALISADA', NULL, NULL, NULL, '', 'COMECO DE OUTUBRO PRA CONTRATAR EMPRESA QUE VAI EXECUTAR A OBRA'
FROM projects p WHERE p.name = 'REFORMA DAS COBERTURAS PREFEITURA' AND p.client = 'PREF.LORENA/SP';