-- Inserindo dados de exemplo para profiles
INSERT INTO profiles (id, email, full_name, role, points, level, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@empresa.com', 'Igor Santos', 'admin', 150, 5, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'gustavo@empresa.com', 'Gustavo Silva', 'user', 80, 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'bessa@empresa.com', 'Bessa Oliveira', 'user', 120, 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'leonardo@empresa.com', 'Leonardo Costa', 'user', 95, 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'pedro@empresa.com', 'Pedro Almeida', 'user', 70, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserindo dados de exemplo para projects
INSERT INTO projects (id, name, client, type, status, description, responsible_ids, contract_start, contract_end, project_value, amount_paid, amount_pending, expenses, profit_margin, created_by, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Residência Moderna Alphaville', 'João Silva', 'privado', 'EM_ANDAMENTO', 'Projeto arquitetônico residencial de alto padrão', 
 ARRAY['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'], 
 '2024-01-15', '2024-06-15', 250000.00, 100000.00, 150000.00, 80000.00, 20.5, 
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440002', 'Edifício Comercial Centro', 'Construtora ABC', 'publico', 'EM_ANDAMENTO', 'Projeto de edifício comercial de 15 andares', 
 ARRAY['550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'], 
 '2024-02-01', '2024-12-31', 800000.00, 200000.00, 600000.00, 120000.00, 25.0, 
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),

('650e8400-e29b-41d4-a716-446655440003', 'Casa de Campo Gramado', 'Maria Santos', 'privado', 'FINALIZADO', 'Projeto de casa de campo com paisagismo', 
 ARRAY['550e8400-e29b-41d4-a716-446655440002'], 
 '2023-08-01', '2023-12-15', 180000.00, 180000.00, 0.00, 50000.00, 30.0, 
 '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserindo dados de exemplo para tasks
INSERT INTO tasks (id, project_id, title, description, assigned_to, status, phase, priority, points, activity_start, due_date, last_delivery, comment, restricoes, dependencies, completed_at, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Levantamento topográfico', 'Realizar levantamento completo do terreno', 
 ARRAY['550e8400-e29b-41d4-a716-446655440002'], 'CONCLUIDA', 'ESTUDO_PRELIMINAR', 'alta', 10, 
 '2024-01-16', '2024-01-25', '2024-01-23', 'Levantamento concluído com sucesso', '', ARRAY[]::text[], '2024-01-23 14:30:00', NOW()),

('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Projeto arquitetônico preliminar', 'Desenvolver estudo preliminar da residência', 
 ARRAY['550e8400-e29b-41d4-a716-446655440003'], 'EM_ANDAMENTO', 'ESTUDO_PRELIMINAR', 'alta', 15, 
 '2024-01-26', '2024-02-15', NULL, 'Em desenvolvimento', 'Aguardar aprovação do levantamento', ARRAY['750e8400-e29b-41d4-a716-446655440001'], NULL, NOW()),

('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'Cálculo estrutural', 'Dimensionamento da estrutura do edifício', 
 ARRAY['550e8400-e29b-41d4-a716-446655440004'], 'PENDENTE', 'PROJETO_BASICO', 'alta', 20, 
 '2024-03-01', '2024-03-30', NULL, '', 'Aguardar projeto arquitetônico', ARRAY[]::text[], NULL, NOW()),

('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Projeto paisagístico', 'Desenvolvimento do paisagismo da casa', 
 ARRAY['550e8400-e29b-41d4-a716-446655440002'], 'CONCLUIDA', 'EXECUTIVO', 'media', 12, 
 '2023-10-01', '2023-11-15', '2023-11-10', 'Projeto entregue antecipadamente', '', ARRAY[]::text[], '2023-11-10 16:00:00', NOW()),

('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'Instalações hidráulicas', 'Projeto das instalações hidrossanitárias', 
 ARRAY['550e8400-e29b-41d4-a716-446655440005'], 'PENDENTE', 'PROJETO_BASICO', 'media', 18, 
 '2024-04-01', '2024-04-25', NULL, '', 'Aguardar estrutural', ARRAY['750e8400-e29b-41d4-a716-446655440003'], NULL, NOW())
ON CONFLICT (id) DO NOTHING;