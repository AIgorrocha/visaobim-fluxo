-- SQL para remover a coluna restriction_description da tabela existente
-- Execute este SQL no Editor SQL do Supabase

-- 1. Remover a coluna restriction_description da tabela task_restrictions
ALTER TABLE task_restrictions DROP COLUMN IF EXISTS restriction_description;

-- 2. Recriar a view sem a coluna restriction_description
CREATE OR REPLACE VIEW task_restrictions_detailed AS
SELECT
  tr.id,
  tr.waiting_task_id,
  tr.blocking_task_id,
  tr.blocking_user_id,
  tr.status,
  tr.created_at,
  tr.resolved_at,
  tr.updated_at,
  wt.title as waiting_task_title,
  wt.status as waiting_task_status,
  wt.assigned_to as waiting_task_assigned_to,
  bt.title as blocking_task_title,
  bt.status as blocking_task_status,
  bt.assigned_to as blocking_task_assigned_to,
  bp.full_name as blocking_user_name,
  bp.email as blocking_user_email
FROM task_restrictions tr
JOIN tasks wt ON tr.waiting_task_id = wt.id
JOIN tasks bt ON tr.blocking_task_id = bt.id
JOIN profiles bp ON tr.blocking_user_id = bp.id;