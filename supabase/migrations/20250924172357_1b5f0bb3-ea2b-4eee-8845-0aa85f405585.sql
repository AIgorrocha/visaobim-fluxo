-- Fix critical security issues: Enable RLS on all public tables that are missing it
-- This addresses the "RLS Disabled in Public" errors from the security linter

-- Enable RLS on tables that don't have it enabled yet
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

-- Fix function search path issues for security
-- Update existing functions to have proper search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_task_restrictions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_resolve_task_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'CONCLUIDA' AND OLD.status != 'CONCLUIDA' THEN
        -- Resolver restrições
        UPDATE task_restrictions
        SET
            status = 'resolved',
            resolved_at = NOW(),
            updated_at = NOW()
        WHERE
            blocking_task_id = NEW.id
            AND status = 'active';

        -- Criar notificações para usuários das tarefas liberadas
        INSERT INTO task_notifications (user_id, task_id, type, title, message)
        SELECT DISTINCT
            unnest(t.assigned_to)::uuid as user_id,
            t.id as task_id,
            'task_released' as type,
            'Tarefa Liberada! 🎉' as title,
            'A tarefa "' || t.title || '" foi liberada e pode ser iniciada.' as message
        FROM tasks t
        WHERE t.id IN (
            SELECT tr.waiting_task_id
            FROM task_restrictions tr
            WHERE tr.blocking_task_id = NEW.id
            AND tr.status = 'resolved'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM task_notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND read = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_restriction_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Notificar o usuário responsável pela tarefa bloqueante
    INSERT INTO task_notifications (user_id, task_id, type, title, message)
    VALUES (
        NEW.blocking_user_id,
        NEW.blocking_task_id,
        'restriction_added',
        'Nova Dependência',
        'Uma tarefa está aguardando a conclusão de "' ||
        (SELECT title FROM tasks WHERE id = NEW.blocking_task_id) || '".'
    );

    RETURN NEW;
END;
$$;