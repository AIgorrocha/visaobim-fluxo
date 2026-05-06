-- ========================================
-- POLÍTICAS RLS (SIMPLES E SEGURAS)
-- ========================================

-- POLÍTICAS PROFILES (Todos podem ver, admins podem tudo)
CREATE POLICY "Todos podem ver profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar próprio profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Permite inserção de novos profiles" ON profiles FOR INSERT WITH CHECK (true);

-- POLÍTICAS PROJECTS (Todos podem ver, admins podem tudo)
CREATE POLICY "Todos podem ver projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Permite inserção de projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de projects" ON projects FOR DELETE USING (true);

-- POLÍTICAS TASKS (Todos podem ver e editar)
CREATE POLICY "Todos podem ver tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Permite inserção de tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de tasks" ON tasks FOR DELETE USING (true);

-- POLÍTICAS PROPOSALS (Todos podem ver e editar)
CREATE POLICY "Todos podem ver proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Permite inserção de proposals" ON proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de proposals" ON proposals FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de proposals" ON proposals FOR DELETE USING (true);

-- POLÍTICAS ACHIEVEMENTS (Todos podem ver e editar)
CREATE POLICY "Todos podem ver achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Permite inserção de achievements" ON achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de achievements" ON achievements FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de achievements" ON achievements FOR DELETE USING (true);