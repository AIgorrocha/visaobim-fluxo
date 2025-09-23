-- ========================================
-- INSERÇÃO DAS TAREFAS DOS PROJETOS 11-19 (LOTE 2)
-- ========================================

-- TAREFAS PROJETO 11: DELEGACIA POLICIA FEDERAL - SPF/RO
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'REVISÃO ORÇAMENTO, CADERNO DE ENCARGOS', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'PROJETO_BASICO', 'EM_ANDAMENTO', '2025-09-19', '2025-09-26', NULL, '', ''
FROM projects p WHERE p.name = 'DELEGACIA POLICIA FEDERAL' AND p.client = 'SPF/RO';

-- TAREFAS PROJETO 12: DELEGACIA DA POLICIA RODOVIARIA FEDERAL - SPRF/AL
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ORCAMENTO EXECUTIVO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'CONCLUIDA', '2025-09-10', '2025-09-19', '2025-09-22', '', 'AGUARDANDO FISCAL APROVAR ORCAMENTO NO ORCAFASCIO PRA EXPORTAR OS ENTREGAVEIS'
FROM projects p WHERE p.name = 'DELEGACIA DA POLICIA RODOVIARIA FEDERAL' AND p.client = 'SPRF/AL';

-- TAREFAS PROJETO 13: LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR - TRE/AC
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ORCAMENTO EXECUTIVO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'CONCLUIDA', NULL, NULL, NULL, '', 'AGUARDANDO PROJETOS, RECOMENDAVEL MONTAR EAP E IR ALINHANDO COM ARQUITETURA OQ JA TEM'
FROM projects p WHERE p.name = 'LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR' AND p.client = 'TRE/AC';

-- TAREFAS PROJETO 14: AGENCIA DE TUBARAO - CELESC/RS
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ARQUITETONICO, INTERIORES E ACESSIBILIDADE EXECUTIVO', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-11-02', NULL, '', ''
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PRE DIMENSIONAMENTO E MODELAGEM INICIAL ESTRUTURA, PLANTA DE FUROS PARA SONDAGEM', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-09-28', NULL, '', 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA'
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'EXECUTIVO ESTRUTURAL E FUNDACOES', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-11-02', NULL, '', 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA'
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO HIDROSSANITARIO', p.id, ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-11-02', NULL, 'ESTRUTURA', 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.'
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ELETRICO, LOGICA E TELEFONIA', p.id, ARRAY['994df657-b61d-4b1e-8a59-416051fd5e99'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-11-02', NULL, 'ESTRUTURA', 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.'
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO CLIMATIZACAO', p.id, ARRAY['905fde13-5c9f-49be-b76a-f76e4ffd124d'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-11-02', NULL, 'ESTRUTURA', 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.'
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO INCENDIO', p.id, ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-11-02', NULL, 'ESTRUTURA', ''
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ORCAMENTO EXECUTIVO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-12-09', NULL, 'ESTRUTURA', ''
FROM projects p WHERE p.name = 'AGENCIA DE TUBARAO' AND p.client = 'CELESC/RS';

-- TAREFAS PROJETO 15: GINASIOS - SOP/RS
INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'MODELAGEM DAS IMPLANTACOES', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 'EXECUTIVO', 'PENDENTE', '2025-09-12', '2025-09-26', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ARQUITETONICO E ACESSIBILIDADE EXECUTIVO', p.id, ARRAY['5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91', 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0'], 'EXECUTIVO', 'PENDENTE', '2025-09-12', '2025-10-05', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO HIDROSSANITARIO', p.id, ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0'], 'EXECUTIVO', 'PENDENTE', '2025-09-12', '2025-10-05', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ELETRICO E LOGICA', p.id, ARRAY['994df657-b61d-4b1e-8a59-416051fd5e99'], 'EXECUTIVO', 'PENDENTE', '2025-09-12', '2025-10-05', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO SPDA E INCENDIO', p.id, ARRAY['6b1b146d-dc85-4030-9558-52b24c1106cb'], 'EXECUTIVO', 'PENDENTE', '2025-09-12', '2025-10-05', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'PROJETO ESTRUTURAL E FUNDACOES', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'PENDENTE', '2025-09-12', '2025-10-05', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'COMPATIBILIZACAO E AJUSTES', p.id, ARRAY['7526fbed-99da-4d87-b647-422f278e961b'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-10-10', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';

INSERT INTO tasks (title, project_id, assigned_to, phase, status, activity_start, due_date, last_delivery, restricoes, comment) 
SELECT 'ORCAMENTO EXECUTIVO', p.id, ARRAY['cc32897a-a98d-4319-90c8-15fb63a55665'], 'EXECUTIVO', 'PENDENTE', NULL, '2025-10-17', NULL, '', ''
FROM projects p WHERE p.name = 'GINASIOS' AND p.client = 'SOP/RS';