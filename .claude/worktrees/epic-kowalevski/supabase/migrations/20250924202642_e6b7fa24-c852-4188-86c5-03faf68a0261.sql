-- Permitir que todos os usuários autenticados possam criar/editar tarefas
DROP POLICY IF EXISTS "tasks_insert_for_authenticated" ON tasks;
DROP POLICY IF EXISTS "tasks_update_for_authenticated" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_for_authenticated" ON tasks;

-- Política para criação de tarefas
CREATE POLICY "tasks_insert_for_authenticated" ON tasks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização de tarefas (próprias ou se for admin)
CREATE POLICY "tasks_update_for_authenticated" ON tasks
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    get_user_role_simple() = 'admin' OR
    (auth.uid())::text = ANY (assigned_to) OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id AND (
        (auth.uid())::text = ANY (p.responsible_ids) OR
        auth.uid() = p.created_by
      )
    )
  )
);

-- Política para exclusão de tarefas (apenas admin ou responsável do projeto)
CREATE POLICY "tasks_delete_for_authenticated" ON tasks
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    get_user_role_simple() = 'admin' OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id AND (
        (auth.uid())::text = ANY (p.responsible_ids) OR
        auth.uid() = p.created_by
      )
    )
  )
);

-- Permitir que todos os usuários autenticados possam criar/editar projetos
DROP POLICY IF EXISTS "projects_insert_for_authenticated" ON projects;
DROP POLICY IF EXISTS "projects_update_for_authenticated" ON projects;
DROP POLICY IF EXISTS "projects_delete_for_authenticated" ON projects;

CREATE POLICY "projects_insert_for_authenticated" ON projects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_update_for_authenticated" ON projects
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    get_user_role_simple() = 'admin' OR
    (auth.uid())::text = ANY (responsible_ids) OR
    auth.uid() = created_by
  )
);

CREATE POLICY "projects_delete_for_authenticated" ON projects
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    get_user_role_simple() = 'admin' OR
    auth.uid() = created_by
  )
);

-- Permitir que todos vejam profiles (necessário para mostrar equipe completa)
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política para atualização de achievements
DROP POLICY IF EXISTS "achievements_insert_for_system" ON achievements;
DROP POLICY IF EXISTS "achievements_update_for_system" ON achievements;
DROP POLICY IF EXISTS "achievements_select_for_users" ON achievements;

CREATE POLICY "achievements_insert_for_system" ON achievements
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "achievements_update_for_system" ON achievements
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "achievements_select_for_users" ON achievements
FOR SELECT
USING (auth.role() = 'authenticated');