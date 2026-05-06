-- Recriar sistema de pontuação completo

-- Função para calcular pontos de um usuário
CREATE OR REPLACE FUNCTION calculate_points_for_user(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_points INTEGER := 0;
    task_record RECORD;
    days_diff INTEGER;
BEGIN
    -- Buscar tarefas concluídas do usuário com datas válidas
    FOR task_record IN 
        SELECT due_date, completed_at 
        FROM tasks 
        WHERE status = 'CONCLUIDA' 
        AND due_date IS NOT NULL 
        AND completed_at IS NOT NULL
        AND (
            -- Verificar se o usuário está na lista de responsáveis
            assigned_to::text ILIKE '%' || target_user_id::text || '%'
        )
    LOOP
        -- Calcular diferença em dias
        days_diff := (task_record.due_date::date - task_record.completed_at::date);
        
        -- Aplicar regras de pontuação
        IF days_diff > 0 THEN
            -- Entregue antecipado: +2 pontos por dia
            total_points := total_points + (days_diff * 2);
        ELSIF days_diff < 0 THEN
            -- Entregue atrasado: -4 pontos por dia
            total_points := total_points + (ABS(days_diff) * -4);
        END IF;
        -- Se days_diff = 0 (no prazo), não adiciona pontos
    END LOOP;
    
    -- Não permitir pontos negativos
    RETURN GREATEST(0, total_points);
END;
$$;

-- Atualizar pontos e níveis de todos os usuários
UPDATE profiles 
SET 
    points = calculate_points_for_user(id),
    level = CASE 
        WHEN calculate_points_for_user(id) < 10 THEN 1
        WHEN calculate_points_for_user(id) < 30 THEN 2
        WHEN calculate_points_for_user(id) < 60 THEN 3
        WHEN calculate_points_for_user(id) < 100 THEN 4
        WHEN calculate_points_for_user(id) < 150 THEN 5
        WHEN calculate_points_for_user(id) < 200 THEN 6
        WHEN calculate_points_for_user(id) < 300 THEN 7
        WHEN calculate_points_for_user(id) < 400 THEN 8
        ELSE 9
    END,
    updated_at = NOW();