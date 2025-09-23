-- ========================================
-- SECURITY FIX: PROPER RLS POLICIES
-- ========================================

-- Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Todos podem ver profiles" ON profiles;
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

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- PROFILES: Only authenticated users can see profiles, users can update their own
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PROJECTS: Users see projects they're responsible for or created, admins see all
CREATE POLICY "Users can view assigned projects" ON projects
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      public.get_current_user_role() = 'admin' OR
      auth.uid()::text = ANY(responsible_ids) OR
      auth.uid() = created_by
    )
  );

CREATE POLICY "Admins can insert projects" ON projects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update projects" ON projects
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

-- TASKS: Users see tasks assigned to them or in their projects, admins see all
CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      public.get_current_user_role() = 'admin' OR
      auth.uid()::text = ANY(assigned_to) OR
      EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = tasks.project_id 
        AND (auth.uid()::text = ANY(p.responsible_ids) OR auth.uid() = p.created_by)
      )
    )
  );

CREATE POLICY "Admins can insert tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Users can update assigned tasks" ON tasks
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      public.get_current_user_role() = 'admin' OR
      auth.uid()::text = ANY(assigned_to)
    )
  );

CREATE POLICY "Admins can delete tasks" ON tasks
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

-- PROPOSALS: Only authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view proposals" ON proposals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert proposals" ON proposals
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update proposals" ON proposals
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete proposals" ON proposals
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

-- ACHIEVEMENTS: Users see their own achievements, admins see all
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      public.get_current_user_role() = 'admin' OR
      auth.uid() = user_id
    )
  );

CREATE POLICY "Admins can insert achievements" ON achievements
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can update achievements" ON achievements
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete achievements" ON achievements
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    public.get_current_user_role() = 'admin'
  );