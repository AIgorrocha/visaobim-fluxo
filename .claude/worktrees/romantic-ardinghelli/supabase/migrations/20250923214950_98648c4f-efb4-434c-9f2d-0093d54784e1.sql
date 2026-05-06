-- Corrigir trigger e finalizar sistema de pontuação

-- Create trigger for task updates (corrigido)
DROP TRIGGER IF EXISTS trigger_update_user_points ON tasks;

CREATE OR REPLACE FUNCTION update_user_points_on_task_completion()
RETURNS TRIGGER AS $$
DECLARE
    user_ids TEXT[];
    user_id UUID;
BEGIN
    -- Get user IDs from assigned_to field
    IF NEW.assigned_to IS NOT NULL THEN
        IF NEW.assigned_to::text ~ '^[{]' THEN
            -- Array format
            user_ids := string_to_array(trim(both '{}' from NEW.assigned_to::text), ',');
        ELSE
            -- Single user format
            user_ids := ARRAY[NEW.assigned_to::text];
        END IF;
        
        -- Update points for each assigned user
        FOREACH user_id IN ARRAY user_ids::UUID[]
        LOOP
            UPDATE profiles 
            SET 
                points = recalculate_user_points(user_id),
                level = CASE 
                    WHEN recalculate_user_points(user_id) < 10 THEN 1
                    WHEN recalculate_user_points(user_id) < 30 THEN 2
                    WHEN recalculate_user_points(user_id) < 60 THEN 3
                    WHEN recalculate_user_points(user_id) < 100 THEN 4
                    WHEN recalculate_user_points(user_id) < 150 THEN 5
                    WHEN recalculate_user_points(user_id) < 200 THEN 6
                    WHEN recalculate_user_points(user_id) < 300 THEN 7
                    WHEN recalculate_user_points(user_id) < 400 THEN 8
                    ELSE 9
                END,
                updated_at = NOW()
            WHERE id = user_id;
        END LOOP;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create separate triggers for INSERT and UPDATE
CREATE TRIGGER trigger_update_user_points_insert
    AFTER INSERT ON tasks
    FOR EACH ROW
    WHEN (NEW.status = 'CONCLUIDA')
    EXECUTE FUNCTION update_user_points_on_task_completion();

CREATE TRIGGER trigger_update_user_points_update
    AFTER UPDATE ON tasks
    FOR EACH ROW
    WHEN (NEW.status = 'CONCLUIDA' OR OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_user_points_on_task_completion();