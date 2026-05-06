-- ========================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA - RLS (FASE 2)
-- ========================================

-- 1. Remover políticas problemáticas permissivas (usar IF EXISTS para evitar erros)
DROP POLICY IF EXISTS "Todos podem ver profiles" ON profiles;
DROP POLICY IF EXISTS "Permite inserção de novos profiles" ON profiles;
DROP POLICY IF EXISTS "Todos podem ver projects" ON projects;
DROP POLICY IF EXISTS "Permite inserção de projects" ON projects;
DROP POLICY IF EXISTS "Permite atualização de projects" ON projects;
DROP POLICY IF EXISTS "Permite exclusão de projects" ON projects;
DROP POLICY IF EXISTS "Todos podem ver tasks" ON tasks;
DROP POLICY IF EXISTS "Permite inserção de tasks" ON tasks;
DROP POLICY IF EXISTS "Permite atualização de tasks" ON tasks;
DROP POLICY IF EXISTS "Permite exclusão de tasks" ON tasks;
DROP POLICY IF EXISTS "Todos podem ver proposals" ON proposals;
DROP POLICY IF EXISTS "Permite inserção de proposals" ON proposals;
DROP POLICY IF EXISTS "Permite atualização de proposals" ON proposals;
DROP POLICY IF EXISTS "Permite exclusão de proposals" ON proposals;
DROP POLICY IF EXISTS "Todos podem ver achievements" ON achievements;
DROP POLICY IF EXISTS "Permite inserção de achievements" ON achievements;
DROP POLICY IF EXISTS "Permite atualização de achievements" ON achievements;
DROP POLICY IF EXISTS "Permite exclusão de achievements" ON achievements;

-- Remover algumas políticas antigas que podem existir
DROP POLICY IF EXISTS "Users can view own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- 2. Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS SEGURAS PARA PROFILES
CREATE POLICY "secure_profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "secure_profiles_select_admin" ON profiles
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "secure_profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "secure_profiles_update_admin" ON profiles
  FOR UPDATE USING (get_current_user_role() = 'admin');

CREATE POLICY "secure_profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. CRIAR POLÍTICAS SEGURAS PARA PROJECTS
CREATE POLICY "secure_projects_select" ON projects
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      auth.uid()::text = ANY(responsible_ids) OR
      auth.uid() = created_by
    )
  );

CREATE POLICY "secure_projects_insert_admin" ON projects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_projects_update_admin" ON projects
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_projects_delete_admin" ON projects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

-- 5. CRIAR POLÍTICAS SEGURAS PARA TASKS
CREATE POLICY "secure_tasks_select" ON tasks
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      auth.uid()::text = ANY(assigned_to) OR
      EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = tasks.project_id 
        AND (auth.uid()::text = ANY(p.responsible_ids) OR auth.uid() = p.created_by)
      )
    )
  );

CREATE POLICY "secure_tasks_insert_admin" ON tasks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_tasks_update" ON tasks
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      auth.uid()::text = ANY(assigned_to)
    )
  );

CREATE POLICY "secure_tasks_delete_admin" ON tasks
  FOR DELETE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

-- 6. CRIAR POLÍTICAS SEGURAS PARA PROPOSALS
CREATE POLICY "secure_proposals_select_authenticated" ON proposals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "secure_proposals_insert_admin" ON proposals
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_proposals_update_admin" ON proposals
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_proposals_delete_admin" ON proposals
  FOR DELETE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

-- 7. CRIAR POLÍTICAS SEGURAS PARA ACHIEVEMENTS
CREATE POLICY "secure_achievements_select" ON achievements
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      get_current_user_role() = 'admin' OR
      auth.uid() = user_id
    )
  );

CREATE POLICY "secure_achievements_insert_admin" ON achievements
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_achievements_update_admin" ON achievements
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

CREATE POLICY "secure_achievements_delete_admin" ON achievements
  FOR DELETE USING (
    auth.role() = 'authenticated' AND get_current_user_role() = 'admin'
  );

-- 8. CORRIGIR VIEW TASK_RESTRICTIONS_DETAILED
DROP VIEW IF EXISTS task_restrictions_detailed;

CREATE VIEW task_restrictions_detailed AS
SELECT 
    tr.id,
    tr.waiting_task_id,
    tr.blocking_task_id,
    tr.blocking_user_id,
    tr.status,
    tr.created_at,
    tr.updated_at,
    tr.resolved_at,
    wt.title as waiting_task_title,
    wt.status as waiting_task_status,
    wt.assigned_to as waiting_task_assigned_to,
    bt.title as blocking_task_title,
    bt.status as blocking_task_status,
    bt.assigned_to as blocking_task_assigned_to,
    p.full_name as blocking_user_name,
    p.email as blocking_user_email
FROM task_restrictions tr
LEFT JOIN tasks wt ON tr.waiting_task_id = wt.id
LEFT JOIN tasks bt ON tr.blocking_task_id = bt.id
LEFT JOIN profiles p ON tr.blocking_user_id = p.id;