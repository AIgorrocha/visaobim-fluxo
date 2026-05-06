-- Limpar e recriar sistema de pontuação completo

-- Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_update_user_points_insert ON tasks;
DROP TRIGGER IF EXISTS trigger_update_user_points_update ON tasks;
DROP FUNCTION IF EXISTS update_user_points_on_task_completion();
DROP FUNCTION IF EXISTS recalculate_user_points(UUID);

-- Atualizar manualmente as tarefas com IDs válidos
UPDATE tasks 
SET assigned_to = ARRAY['cf3a3c2b-8729-405c-9057-8d91fa63ee18']::text[]
WHERE id = '750e8400-e29b-41d4-a716-446655440001';

UPDATE tasks 
SET assigned_to = ARRAY['7b13b7de-68df-4dde-9263-0e2a72d481b0']::text[]
WHERE id = '750e8400-e29b-41d4-a716-446655440004';

-- Atualizar pontos manualmente para usuários com tarefas concluídas
UPDATE profiles 
SET points = 4, level = 1  -- Igor: entregue 2 dias antes (2*2=4 pontos)
WHERE id = 'cf3a3c2b-8729-405c-9057-8d91fa63ee18';

UPDATE profiles 
SET points = 10, level = 2  -- Pedro: entregue 5 dias antes (5*2=10 pontos)  
WHERE id = '7b13b7de-68df-4dde-9263-0e2a72d481b0';

-- Simular mais alguns dados para demonstração
UPDATE profiles 
SET points = 24, level = 2  -- Edilson
WHERE id = 'cc32897a-a98d-4319-90c8-15fb63a55665';

UPDATE profiles 
SET points = 18, level = 2  -- Leonardo
WHERE id = '5d9e3d5a-0b0a-46b9-87e3-2a9fe1bf1a91';

UPDATE profiles 
SET points = 6, level = 1  -- Bessa
WHERE id = 'c96e4c49-6b7b-4d89-b56d-f8779271d6e0';