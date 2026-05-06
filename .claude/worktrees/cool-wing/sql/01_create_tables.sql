-- ========================================
-- TABELAS SUPABASE - VISÃO BIM CRM
-- Execute este script no SQL Editor do Supabase
-- ========================================

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