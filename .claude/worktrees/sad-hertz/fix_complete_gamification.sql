-- SCRIPT COMPLETO PARA REMOVER TUDO RELACIONADO À GAMIFICAÇÃO
-- Execute este script no Supabase SQL Editor

-- 1. Remover TODOS os triggers relacionados a tarefas
DROP TRIGGER IF EXISTS calculate_points_on_task_update ON tasks;
DROP TRIGGER IF EXISTS calculate_task_points_trigger ON tasks;
DROP TRIGGER IF EXISTS task_points_trigger ON tasks;
DROP TRIGGER IF EXISTS update_points_trigger ON tasks;
DROP TRIGGER IF EXISTS gamification_trigger ON tasks;
DROP TRIGGER IF EXISTS points_calculation_trigger ON tasks;

-- 2. Remover TODAS as funções relacionadas a pontos
DROP FUNCTION IF EXISTS calculate_task_points(date, timestamp with time zone);
DROP FUNCTION IF EXISTS calculate_task_points(date);
DROP FUNCTION IF EXISTS calculate_task_points();
DROP FUNCTION IF EXISTS update_task_points();
DROP FUNCTION IF EXISTS calculate_points();
DROP FUNCTION IF EXISTS update_user_points();
DROP FUNCTION IF EXISTS calculate_user_level();
DROP FUNCTION IF EXISTS gamification_update();

-- 3. Verificar se há views que referenciam pontos
DROP VIEW IF EXISTS task_points_view;
DROP VIEW IF EXISTS user_points_view;
DROP VIEW IF EXISTS gamification_view;

-- 4. Limpar colunas relacionadas a pontos da tabela tasks
ALTER TABLE tasks DROP COLUMN IF EXISTS points;
ALTER TABLE tasks DROP COLUMN IF EXISTS score;
ALTER TABLE tasks DROP COLUMN IF EXISTS task_points;
ALTER TABLE tasks DROP COLUMN IF EXISTS level;
ALTER TABLE tasks DROP COLUMN IF EXISTS experience;
ALTER TABLE tasks DROP COLUMN IF EXISTS xp;

-- 5. Limpar colunas de outras tabelas se existirem
ALTER TABLE profiles DROP COLUMN IF EXISTS points;
ALTER TABLE profiles DROP COLUMN IF EXISTS score;
ALTER TABLE profiles DROP COLUMN IF EXISTS level;
ALTER TABLE profiles DROP COLUMN IF EXISTS experience;
ALTER TABLE profiles DROP COLUMN IF EXISTS xp;

-- 6. Remover policies relacionadas a pontos
DROP POLICY IF EXISTS "points_policy" ON tasks;
DROP POLICY IF EXISTS "gamification_policy" ON tasks;
DROP POLICY IF EXISTS "score_policy" ON tasks;

-- 7. Remover qualquer tabela específica de pontuação se existir
DROP TABLE IF EXISTS task_points;
DROP TABLE IF EXISTS user_points;
DROP TABLE IF EXISTS gamification_data;
DROP TABLE IF EXISTS achievement_points;

-- 8. Verificar e listar qualquer objeto restante que contenha "point" no nome
SELECT
    schemaname,
    tablename,
    attname as column_name,
    typname as data_type
FROM
    pg_attribute
    JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
WHERE
    pg_namespace.nspname = 'public'
    AND pg_attribute.attname ILIKE '%point%'
    AND NOT pg_attribute.attisdropped;

-- 9. Verificar triggers restantes
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM
    information_schema.triggers
WHERE
    trigger_schema = 'public'
    AND (trigger_name ILIKE '%point%' OR action_statement ILIKE '%point%');

-- 10. Verificar funções restantes
SELECT
    routine_name,
    routine_definition
FROM
    information_schema.routines
WHERE
    routine_schema = 'public'
    AND (routine_name ILIKE '%point%' OR routine_definition ILIKE '%point%');

COMMIT;