-- 🚨 SCRIPT FINAL DE LIMPEZA COMPLETA - EXECUTE NO SUPABASE SQL EDITOR

-- 1. Desabilitar Row Level Security temporariamente para limpeza
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODOS os triggers da tabela tasks (incluindo possíveis triggers ocultos)
DROP TRIGGER IF EXISTS calculate_points_on_task_update ON tasks CASCADE;
DROP TRIGGER IF EXISTS calculate_task_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS task_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS update_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS gamification_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS points_calculation_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS update_task_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS task_gamification_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS auto_points_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS points_update_trigger ON tasks CASCADE;

-- 3. Listar e remover TODOS os triggers restantes na tabela tasks
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'tasks'
        AND trigger_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON tasks CASCADE';
        RAISE NOTICE 'Removido trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 4. Remover TODAS as funções relacionadas a pontos (incluindo variações)
DROP FUNCTION IF EXISTS calculate_task_points(date, timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS calculate_task_points(date) CASCADE;
DROP FUNCTION IF EXISTS calculate_task_points() CASCADE;
DROP FUNCTION IF EXISTS calculate_points_for_user() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_points_automatic() CASCADE;
DROP FUNCTION IF EXISTS recalculate_user_total_points() CASCADE;
DROP FUNCTION IF EXISTS update_task_points() CASCADE;
DROP FUNCTION IF EXISTS task_points_calculator() CASCADE;
DROP FUNCTION IF EXISTS gamification_update() CASCADE;
DROP FUNCTION IF EXISTS auto_calculate_points() CASCADE;
DROP FUNCTION IF EXISTS update_points_on_task_change() CASCADE;

-- 5. Buscar e remover todas as funções que contenham 'points' no nome
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT routine_name, routine_schema
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND (routine_name ILIKE '%point%' OR routine_name ILIKE '%gamif%')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.routine_schema || '.' || func_record.routine_name || ' CASCADE';
        RAISE NOTICE 'Removida função: %', func_record.routine_name;
    END LOOP;
END $$;

-- 6. Remover colunas relacionadas a pontos da tabela tasks
ALTER TABLE tasks DROP COLUMN IF EXISTS points CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS score CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS task_points CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS level CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS experience CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS xp CASCADE;
ALTER TABLE tasks DROP COLUMN IF EXISTS gamification_data CASCADE;

-- 7. Limpar colunas de outras tabelas relacionadas
ALTER TABLE profiles DROP COLUMN IF EXISTS points CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS score CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS level CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS experience CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS xp CASCADE;

-- 8. Remover policies relacionadas a pontos
DROP POLICY IF EXISTS "points_policy" ON tasks;
DROP POLICY IF EXISTS "gamification_policy" ON tasks;
DROP POLICY IF EXISTS "score_policy" ON tasks;
DROP POLICY IF EXISTS "task_points_policy" ON tasks;

-- 9. Remover tabelas específicas de pontuação se existirem
DROP TABLE IF EXISTS task_points CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
DROP TABLE IF EXISTS gamification_data CASCADE;
DROP TABLE IF EXISTS achievement_points CASCADE;
DROP TABLE IF EXISTS points_history CASCADE;

-- 10. Remover views relacionadas
DROP VIEW IF EXISTS task_points_view CASCADE;
DROP VIEW IF EXISTS user_points_view CASCADE;
DROP VIEW IF EXISTS gamification_view CASCADE;

-- 11. Recriar policies básicas para a tabela tasks (sem referências a pontos)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem suas próprias tarefas
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (
        auth.uid()::text = ANY(assigned_to) OR
        auth.uid() IN (
            SELECT p.id FROM projects p WHERE p.id = tasks.project_id AND auth.uid()::text = ANY(p.responsible_ids)
        )
    );

-- Policy para usuários editarem suas próprias tarefas
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (
        auth.uid()::text = ANY(assigned_to) OR
        auth.uid() IN (
            SELECT p.id FROM projects p WHERE p.id = tasks.project_id AND auth.uid()::text = ANY(p.responsible_ids)
        )
    );

-- Policy para usuários criarem tarefas
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (true);

-- 12. Verificação final - listar objetos restantes
SELECT 'TRIGGERS RESTANTES:' as tipo;
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND event_object_table = 'tasks';

SELECT 'FUNÇÕES COM POINTS:' as tipo;
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name ILIKE '%point%' OR routine_definition ILIKE '%point%');

SELECT 'COLUNAS COM POINTS:' as tipo;
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name ILIKE '%point%';

COMMIT;

-- 13. Mensagem de confirmação
SELECT '✅ LIMPEZA COMPLETA FINALIZADA! Agora teste o salvamento de tarefas.' as status;