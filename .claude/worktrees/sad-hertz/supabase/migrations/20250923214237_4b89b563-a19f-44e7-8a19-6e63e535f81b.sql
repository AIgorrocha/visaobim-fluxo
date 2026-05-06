-- Update user points based on completed tasks
-- This migration calculates points for all users based on their completed tasks
-- +2 points per day delivered early, -4 points per day delivered late, 0 points if on time

-- Create a temporary function to calculate user points
CREATE OR REPLACE FUNCTION calculate_user_points(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
    task_record RECORD;
    days_diff INTEGER;
BEGIN
    -- Get all completed tasks for this user
    FOR task_record IN 
        SELECT due_date, completed_at 
        FROM tasks 
        WHERE status = 'CONCLUIDA' 
        AND (
            (assigned_to::text[] @> ARRAY[user_id::text]) OR 
            assigned_to::text = user_id::text
        )
        AND due_date IS NOT NULL 
        AND completed_at IS NOT NULL
    LOOP
        -- Calculate difference in days
        days_diff := DATE_PART('day', task_record.due_date::date - task_record.completed_at::date);
        
        -- Apply scoring rules
        IF days_diff > 0 THEN
            -- Delivered early: +2 points per day
            total_points := total_points + (days_diff * 2);
        ELSIF days_diff < 0 THEN
            -- Delivered late: -4 points per day (but don't go negative)
            total_points := total_points + (days_diff * 4);
        END IF;
        -- If days_diff = 0 (on time), no points added
    END LOOP;
    
    -- Don't allow negative total points
    RETURN GREATEST(0, total_points);
END;
$$ LANGUAGE plpgsql;

-- Update all user points
UPDATE profiles 
SET 
    points = calculate_user_points(id),
    level = CASE 
        WHEN calculate_user_points(id) < 0 THEN 1
        WHEN calculate_user_points(id) < 10 THEN 1
        WHEN calculate_user_points(id) < 30 THEN 2
        WHEN calculate_user_points(id) < 60 THEN 3
        WHEN calculate_user_points(id) < 100 THEN 4
        WHEN calculate_user_points(id) < 150 THEN 5
        WHEN calculate_user_points(id) < 200 THEN 6
        WHEN calculate_user_points(id) < 300 THEN 7
        WHEN calculate_user_points(id) < 400 THEN 8
        ELSE 9
    END,
    updated_at = NOW()
WHERE id IN (SELECT DISTINCT unnest(assigned_to::text[])::uuid FROM tasks WHERE assigned_to IS NOT NULL);

-- Drop the temporary function
DROP FUNCTION calculate_user_points(UUID);