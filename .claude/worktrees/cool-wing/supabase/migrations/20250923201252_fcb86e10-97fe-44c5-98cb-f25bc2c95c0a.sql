-- ========================================
-- CRIAR TABELAS PARA CRM VISÃO BIM
-- ========================================

-- 1. TABELA PROFILES (Usuários)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA PROJECTS (Projetos)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('privado', 'publico')),
  status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'EM_ESPERA', 'PARALISADO', 'CONCLUIDO', 'AGUARDANDO_PAGAMENTO')),
  description TEXT,
  responsible_ids TEXT[] DEFAULT '{}',
  dependency_id UUID,
  contract_start DATE,
  contract_end DATE,
  prazo_vigencia DATE,
  -- Campos financeiros
  project_value DECIMAL(12,2),
  amount_paid DECIMAL(12,2),
  amount_pending DECIMAL(12,2),
  expenses DECIMAL(12,2),
  profit_margin DECIMAL(5,2),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- 3. TABELA TASKS (Tarefas)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'PARALISADA', 'EM_ESPERA')),
  phase TEXT CHECK (phase IN ('ESTUDO_PRELIMINAR', 'PROJETO_BASICO', 'EXECUTIVO')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
  points INTEGER DEFAULT 0,
  activity_start DATE,
  due_date DATE,
  last_delivery DATE,
  comment TEXT,
  restricoes TEXT,
  dependencies TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- 4. TABELA PROPOSALS (Propostas)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  proposal_date DATE NOT NULL,
  proposal_value DECIMAL(12,2) NOT NULL,
  last_meeting DATE,
  proposal_link TEXT,
  followup_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'negociando')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- 5. TABELA ACHIEVEMENTS (Conquistas)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  points_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlocked BOOLEAN DEFAULT FALSE
);

-- 6. TABELA ACTIVITY_LOGS (Logs de Atividade)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TRIGGERS AUTOMÁTICOS
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- HABILITAR ROW LEVEL SECURITY
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS RLS
-- ========================================

-- POLÍTICAS PROFILES
CREATE POLICY "Todos podem ver profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar próprio profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Permite inserção de novos profiles" ON profiles FOR INSERT WITH CHECK (true);

-- POLÍTICAS PROJECTS
CREATE POLICY "Todos podem ver projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Permite inserção de projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de projects" ON projects FOR DELETE USING (true);

-- POLÍTICAS TASKS
CREATE POLICY "Todos podem ver tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Permite inserção de tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de tasks" ON tasks FOR DELETE USING (true);

-- POLÍTICAS PROPOSALS
CREATE POLICY "Todos podem ver proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Permite inserção de proposals" ON proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de proposals" ON proposals FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de proposals" ON proposals FOR DELETE USING (true);

-- POLÍTICAS ACHIEVEMENTS
CREATE POLICY "Todos podem ver achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Permite inserção de achievements" ON achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Permite atualização de achievements" ON achievements FOR UPDATE USING (true);
CREATE POLICY "Permite exclusão de achievements" ON achievements FOR DELETE USING (true);

-- POLÍTICAS ACTIVITY_LOGS
CREATE POLICY "Todos podem ver activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Permite inserção de activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX idx_projects_responsible ON projects USING GIN (responsible_ids);
CREATE INDEX idx_tasks_assigned ON tasks USING GIN (assigned_to);
CREATE INDEX idx_tasks_project ON tasks (project_id);
CREATE INDEX idx_achievements_user ON achievements (user_id);
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_proposals_status ON proposals (status);
CREATE INDEX idx_activity_logs_user ON activity_logs (user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs (entity_type, entity_id);