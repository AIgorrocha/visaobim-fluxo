-- ========================================
-- SCRIPT PARA CORRIGIR FUNÇÕES AUSENTES NO SUPABASE
-- Execute este script no Supabase SQL Editor
-- ========================================

-- 1. Função para calcular nível do usuário baseado nos pontos (20 pontos por nível)
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_points integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Sistema de 20 pontos por nível
    RETURN GREATEST(1, FLOOR(user_points / 20) + 1);
END;
$$;

-- 2. Função para calcular pontos de uma tarefa baseado nas datas
CREATE OR REPLACE FUNCTION public.calculate_task_points(p_due_date date, p_completed_at timestamp)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    days_diff integer;
BEGIN
    -- Se não tem data de entrega ou data de prazo, não há pontos
    IF p_due_date IS NULL OR p_completed_at IS NULL THEN
        RETURN 0;
    END IF;

    -- Calcular diferença em dias (prazo - entrega)
    days_diff := (p_due_date::date - p_completed_at::date);

    -- Aplicar regras: +2 antecipado, -4 atrasado, 0 no prazo
    IF days_diff > 0 THEN
        RETURN days_diff * 2;  -- Antecipado
    ELSIF days_diff < 0 THEN
        RETURN ABS(days_diff) * -4;  -- Atrasado
    ELSE
        RETURN 0;  -- No prazo
    END IF;
END;
$$;

-- 3. Função para recalcular pontos totais de um usuário
CREATE OR REPLACE FUNCTION public.recalculate_user_total_points(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_points integer := 0;
    task_record RECORD;
BEGIN
    -- Somar pontos de todas as tarefas concluídas do usuário
    FOR task_record IN
        SELECT points
        FROM tasks
        WHERE status = 'CONCLUIDA'
        AND user_uuid::text = ANY(assigned_to)
        AND points IS NOT NULL
    LOOP
        total_points := total_points + task_record.points;
    END LOOP;

    -- Não permitir pontos negativos
    RETURN GREATEST(0, total_points);
END;
$$;

-- 4. Função para calcular pontos automaticamente (alternativa)
CREATE OR REPLACE FUNCTION public.calculate_user_points_automatic(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN recalculate_user_total_points(user_uuid);
END;
$$;

-- 5. Trigger para atualizar pontos da tarefa e do usuário automaticamente
CREATE OR REPLACE FUNCTION public.auto_update_task_and_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id uuid;
    calculated_points integer;
    user_total_points integer;
    calculated_level integer;
BEGIN
    -- Calcular pontos da tarefa baseado nas datas
    NEW.points := calculate_task_points(NEW.due_date, NEW.completed_at);

    -- Se a tarefa foi concluída, atualizar pontos dos usuários responsáveis
    IF NEW.status = 'CONCLUIDA' AND NEW.assigned_to IS NOT NULL THEN
        FOR user_id IN SELECT unnest(NEW.assigned_to)::uuid
        LOOP
            -- Recalcular total de pontos do usuário
            user_total_points := recalculate_user_total_points(user_id);
            calculated_level := calculate_user_level(user_total_points);

            -- Atualizar profile do usuário
            UPDATE profiles
            SET
                points = user_total_points,
                level = calculated_level,
                updated_at = NOW()
            WHERE id = user_id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

-- 6. Remover trigger existente se houver e criar novo
DROP TRIGGER IF EXISTS trigger_auto_update_task_points ON tasks;
CREATE TRIGGER trigger_auto_update_task_points
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_task_and_user_points();

-- 7. Função para recalcular todos os usuários manualmente
CREATE OR REPLACE FUNCTION public.recalculate_all_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
    calculated_points integer;
    calculated_level integer;
BEGIN
    -- Recalcular para todos os usuários
    FOR user_record IN SELECT id FROM profiles
    LOOP
        calculated_points := recalculate_user_total_points(user_record.id);
        calculated_level := calculate_user_level(calculated_points);

        UPDATE profiles
        SET
            points = calculated_points,
            level = calculated_level,
            updated_at = NOW()
        WHERE id = user_record.id;
    END LOOP;
END;
$$;

-- ========================================
-- PARA EXECUTAR:
-- 1. Copie todo este conteúdo
-- 2. Cole no Supabase SQL Editor
-- 3. Execute o script
-- 4. Execute: SELECT recalculate_all_users(); para recalcular todos os usuários
-- ========================================