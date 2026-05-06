-- Fix Security Definer View issue by recreating the view
DROP VIEW IF EXISTS task_restrictions_detailed;

CREATE VIEW task_restrictions_detailed AS 
SELECT 
    tr.id,
    tr.waiting_task_id,
    tr.blocking_task_id,
    tr.blocking_user_id,
    tr.status,
    tr.created_at,
    tr.resolved_at,
    tr.updated_at,
    wt.title AS waiting_task_title,
    wt.status AS waiting_task_status,
    wt.assigned_to AS waiting_task_assigned_to,
    bt.title AS blocking_task_title,
    bt.status AS blocking_task_status,
    bt.assigned_to AS blocking_task_assigned_to,
    bp.full_name AS blocking_user_name,
    bp.email AS blocking_user_email
FROM task_restrictions tr
LEFT JOIN tasks wt ON tr.waiting_task_id = wt.id
LEFT JOIN tasks bt ON tr.blocking_task_id = bt.id  
LEFT JOIN profiles bp ON tr.blocking_user_id = bp.id;