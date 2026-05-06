-- Função para calcular pontos automaticamente baseado nas tarefas
CREATE OR REPLACE FUNCTION public.calculate_user_points_automatic(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_points INTEGER := 0;
    task_record RECORD;
    days_diff INTEGER;
BEGIN
    -- Calcular pontos baseado nas tarefas concluídas
    FOR task_record IN 
        SELECT due_date, completed_at, points
        FROM tasks 
        WHERE status = 'CONCLUIDA' 
        AND due_date IS NOT NULL 
        AND completed_at IS NOT NULL
        AND user_uuid::text = ANY(assigned_to)
    LOOP
        -- Calcular diferença em dias (prazo - entrega)
        days_diff := (task_record.due_date::date - task_record.completed_at::date);
        
        -- Aplicar regras de pontuação
        IF days_diff > 0 THEN
            -- Entregue antecipado: +2 pontos por dia
            total_points := total_points + (days_diff * 2);
        ELSIF days_diff < 0 THEN
            -- Entregue atrasado: -4 pontos por dia
            total_points := total_points + (ABS(days_diff) * -4);
        END IF;
        -- Se days_diff = 0 (no prazo), não adiciona pontos extras
        
        -- Adicionar pontos base da tarefa
        total_points := total_points + COALESCE(task_record.points, 0);
    END LOOP;
    
    -- Não permitir pontos negativos
    RETURN GREATEST(0, total_points);
END;
$$;

-- Função para calcular nível baseado nos pontos
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_points integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF user_points < 0 THEN RETURN 0; END IF;
    IF user_points < 10 THEN RETURN 1; END IF;
    IF user_points < 30 THEN RETURN 2; END IF;
    IF user_points < 60 THEN RETURN 3; END IF;
    IF user_points < 100 THEN RETURN 4; END IF;
    IF user_points < 150 THEN RETURN 5; END IF;
    IF user_points < 200 THEN RETURN 6; END IF;
    IF user_points < 300 THEN RETURN 7; END IF;
    IF user_points < 400 THEN RETURN 8; END IF;
    RETURN 9;
END;
$$;

-- Função para atualizar pontuação e nível automaticamente
CREATE OR REPLACE FUNCTION public.update_user_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id uuid;
    calculated_points integer;
    calculated_level integer;
BEGIN
    -- Se a tarefa foi marcada como concluída
    IF NEW.status = 'CONCLUIDA' AND OLD.status != 'CONCLUIDA' THEN
        -- Processar cada usuário responsável pela tarefa
        IF NEW.assigned_to IS NOT NULL THEN
            FOR user_id IN SELECT unnest(NEW.assigned_to)::uuid
            LOOP
                -- Calcular pontos do usuário
                calculated_points := calculate_user_points_automatic(user_id);
                calculated_level := calculate_user_level(calculated_points);
                
                -- Atualizar profile do usuário
                UPDATE profiles 
                SET 
                    points = calculated_points,
                    level = calculated_level,
                    updated_at = NOW()
                WHERE id = user_id;
                
                -- Log da atualização
                INSERT INTO activity_logs (user_id, action, details, entity_type)
                VALUES (
                    user_id,
                    'SCORE_UPDATE',
                    json_build_object(
                        'task_id', NEW.id,
                        'task_title', NEW.title,
                        'old_points', (SELECT points FROM profiles WHERE id = user_id),
                        'new_points', calculated_points,
                        'new_level', calculated_level
                    ),
                    'scoring'
                );
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger para atualização automática de pontuação
DROP TRIGGER IF EXISTS trigger_update_user_score ON tasks;
CREATE TRIGGER trigger_update_user_score
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_user_score();

-- Função para recalcular pontuação de todos os usuários (para sincronização)
CREATE OR REPLACE FUNCTION public.recalculate_all_user_scores()
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
        calculated_points := calculate_user_points_automatic(user_record.id);
        calculated_level := calculate_user_level(calculated_points);
        
        UPDATE profiles 
        SET 
            points = calculated_points,
            level = calculated_level,
            updated_at = NOW()
        WHERE id = user_record.id;
    END LOOP;
    
    -- Log da recalculação geral
    INSERT INTO activity_logs (action, details, entity_type)
    VALUES (
        'MASS_SCORE_RECALCULATION',
        json_build_object('timestamp', NOW(), 'users_updated', (SELECT COUNT(*) FROM profiles)),
        'scoring'
    );
END;
$$;