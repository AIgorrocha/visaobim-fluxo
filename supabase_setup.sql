-- ====================================
-- SETUP SUPABASE PARA VISÃO BIM CRM
-- ====================================

-- 1. TABELA PROFILES (Usuários)
CREATE TABLE profiles (
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
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('privado', 'publico')),
  status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'EM_ESPERA', 'PARALISADO', 'CONCLUIDO', 'AGUARDANDO_PAGAMENTO')),
  description TEXT,
  responsible_ids TEXT[] DEFAULT '{}',
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA TASKS (Tarefas)
CREATE TABLE tasks (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA PROPOSALS (Propostas)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  proposal_date DATE NOT NULL,
  proposal_value DECIMAL(12,2) NOT NULL,
  last_meeting DATE,
  proposal_link TEXT,
  followup_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada', 'negociando')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA ACHIEVEMENTS (Conquistas)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- TRIGGERS PARA AUTO-UPDATE
-- ====================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ====================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ====================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PROFILES
CREATE POLICY "Todos podem ver profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar próprio profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins podem inserir/atualizar qualquer profile" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);

-- POLÍTICAS PROJECTS
CREATE POLICY "Todos podem ver projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admins podem fazer tudo em projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Usuários podem ver projects onde são responsáveis" ON projects FOR SELECT USING (
  auth.uid()::text = ANY(responsible_ids)
);

-- POLÍTICAS TASKS
CREATE POLICY "Todos podem ver tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Admins podem fazer tudo em tasks" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Usuários podem atualizar tasks onde são responsáveis" ON tasks FOR UPDATE USING (
  auth.uid()::text = ANY(assigned_to)
);

-- POLÍTICAS PROPOSALS
CREATE POLICY "Todos podem ver proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Admins podem fazer tudo em proposals" ON proposals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);

-- POLÍTICAS ACHIEVEMENTS
CREATE POLICY "Usuários podem ver próprias achievements" ON achievements FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins podem fazer tudo em achievements" ON achievements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);

-- ====================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================

CREATE INDEX idx_projects_responsible ON projects USING GIN (responsible_ids);
CREATE INDEX idx_tasks_assigned ON tasks USING GIN (assigned_to);
CREATE INDEX idx_tasks_project ON tasks (project_id);
CREATE INDEX idx_achievements_user ON achievements (user_id);
CREATE INDEX idx_profiles_email ON profiles (email);