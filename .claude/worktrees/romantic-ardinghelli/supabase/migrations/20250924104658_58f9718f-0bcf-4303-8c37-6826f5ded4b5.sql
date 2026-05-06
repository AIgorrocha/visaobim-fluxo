-- ========================================
-- AJUSTAR POLÍTICAS RLS PARA MELHOR ACESSO A DADOS
-- ========================================

-- REMOVER POLÍTICAS ANTIGAS RESTRITIVAS
DROP POLICY IF EXISTS "Users can view assigned projects" ON projects;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can view proposals" ON proposals;
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;

-- CRIAR POLÍTICAS MAIS PERMISSIVAS PARA ADMINS E USUÁRIOS AUTENTICADOS

-- PROJETOS: Admins veem tudo, usuários veem projetos públicos e onde são responsáveis
CREATE POLICY "Admins can view all projects" ON projects
FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    get_current_user_role() = 'admin' OR
    type = 'publico' OR
    auth.uid()::text = ANY(responsible_ids) OR
    auth.uid() = created_by
  )
);

-- TAREFAS: Admins veem tudo, usuários veem tarefas onde são responsáveis ou de projetos públicos
CREATE POLICY "Admins can view all tasks" ON tasks
FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    get_current_user_role() = 'admin' OR
    auth.uid()::text = ANY(assigned_to) OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = tasks.project_id 
      AND (
        p.type = 'publico' OR
        auth.uid()::text = ANY(p.responsible_ids) OR
        auth.uid() = p.created_by
      )
    )
  )
);

-- PROPOSTAS: Todos usuários autenticados podem ver
CREATE POLICY "Authenticated users can view all proposals" ON proposals
FOR SELECT USING (auth.role() = 'authenticated');

-- CONQUISTAS: Admins veem tudo, usuários veem só as suas
CREATE POLICY "Users can view achievements" ON achievements
FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    get_current_user_role() = 'admin' OR
    auth.uid() = user_id
  )
);

-- ADICIONAR POLÍTICA TEMPORÁRIA MAIS PERMISSIVA PARA DEBUG
-- (Esta política permite que usuários autenticados vejam mais dados para debug)
CREATE POLICY "Debug policy for projects" ON projects
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Debug policy for tasks" ON tasks  
FOR SELECT USING (auth.role() = 'authenticated');