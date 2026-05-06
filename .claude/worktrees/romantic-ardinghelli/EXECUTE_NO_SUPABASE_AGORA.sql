-- 🚨 EXECUTE ESTE SCRIPT IMEDIATAMENTE NO SUPABASE SQL EDITOR

-- Remover TODOS os triggers da tabela tasks
DROP TRIGGER IF EXISTS calculate_points_on_task_update ON tasks CASCADE;
DROP TRIGGER IF EXISTS calculate_task_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS task_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS update_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS gamification_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS points_calculation_trigger ON tasks CASCADE;

-- Remover TODAS as funções relacionadas a pontos
DROP FUNCTION IF EXISTS calculate_task_points(date, timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS calculate_task_points(date) CASCADE;
DROP FUNCTION IF EXISTS calculate_task_points() CASCADE;
DROP FUNCTION IF EXISTS calculate_points_for_user() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_points_automatic() CASCADE;
DROP FUNCTION IF EXISTS recalculate_user_total_points() CASCADE;

-- Remover coluna points da tabela tasks se existir
ALTER TABLE tasks DROP COLUMN IF EXISTS points CASCADE;

-- Verificar se há outras colunas relacionadas
ALTER TABLE tasks DROP COLUMN IF EXISTS score CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS task_points CASCADE;

COMMIT;