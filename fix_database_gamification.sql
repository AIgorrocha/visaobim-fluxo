-- Remover função de pontuação que não existe mais
-- Executar este script no Supabase SQL Editor

-- 1. Remover trigger que chama a função
DROP TRIGGER IF EXISTS calculate_points_on_task_update ON tasks;
DROP TRIGGER IF EXISTS calculate_task_points_trigger ON tasks;

-- 2. Remover a função se existir
DROP FUNCTION IF EXISTS calculate_task_points(date, timestamp with time zone);
DROP FUNCTION IF EXISTS calculate_task_points(date);
DROP FUNCTION IF EXISTS calculate_task_points();

-- 3. Limpar qualquer coluna relacionada a pontos se existir
ALTER TABLE tasks DROP COLUMN IF EXISTS points;
ALTER TABLE tasks DROP COLUMN IF EXISTS score;
ALTER TABLE tasks DROP COLUMN IF EXISTS task_points;

-- 4. Remover qualquer policy que reference pontos
DROP POLICY IF EXISTS "points_policy" ON tasks;

-- 5. Verificar se há outras funções relacionadas
DROP FUNCTION IF EXISTS update_user_points();
DROP FUNCTION IF EXISTS calculate_user_level();

COMMIT;