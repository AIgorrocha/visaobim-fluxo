import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://actwuuyqumsksulzkmss.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdHd1dXlxdW1za3N1bHprbXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQyNTk5NiwiZXhwIjoyMDcwMDAxOTk2fQ.gAxkkXmrW_UJJllPC-17ps_MtgAZK6O0apPBEl9AXXo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Iniciando setup do banco Supabase...')

  try {
    // 1. CRIAR TABELA PROFILES
    console.log('📝 Criando tabela profiles...')
    const profilesSQL = `
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
    `
    await supabase.rpc('exec_sql', { sql: profilesSQL })

    // 2. CRIAR TABELA PROJECTS
    console.log('📝 Criando tabela projects...')
    const projectsSQL = `
      CREATE TABLE IF NOT EXISTS projects (
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
    `
    await supabase.rpc('exec_sql', { sql: projectsSQL })

    // 3. CRIAR TABELA TASKS
    console.log('📝 Criando tabela tasks...')
    const tasksSQL = `
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    await supabase.rpc('exec_sql', { sql: tasksSQL })

    // 4. CRIAR TABELA PROPOSALS
    console.log('📝 Criando tabela proposals...')
    const proposalsSQL = `
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    await supabase.rpc('exec_sql', { sql: proposalsSQL })

    // 5. CRIAR TABELA ACHIEVEMENTS
    console.log('📝 Criando tabela achievements...')
    const achievementsSQL = `
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        achievement_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        points_earned INTEGER DEFAULT 0,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    await supabase.rpc('exec_sql', { sql: achievementsSQL })

    console.log('✅ Tabelas criadas com sucesso!')

    // 6. INSERIR DADOS INICIAIS
    console.log('📊 Inserindo dados iniciais...')

    // Inserir usuários
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .insert([
        { id: '1', email: 'igor@visaoprojetosbim.com', full_name: 'Igor', role: 'admin', points: 25, level: 1 },
        { id: '2', email: 'gustavo@visaoprojetosbim.com', full_name: 'Gustavo', role: 'user', points: 850, level: 3 },
        { id: '3', email: 'bessa@visaoprojetosbim.com', full_name: 'Bessa', role: 'user', points: 650, level: 2 },
        { id: '4', email: 'leonardo@visaoprojetosbim.com', full_name: 'Leonardo', role: 'user', points: 1200, level: 4 },
        { id: '5', email: 'pedro@visaoprojetosbim.com', full_name: 'Pedro', role: 'user', points: 450, level: 2 }
      ])

    if (usersError) {
      console.log('⚠️ Usuários já existem ou erro:', usersError.message)
    } else {
      console.log('✅ Usuários inseridos!')
    }

    console.log('🎉 Setup do Supabase concluído com sucesso!')
    console.log('🔗 URL: https://actwuuyqumsksulzkmss.supabase.co')
    console.log('📋 Tabelas criadas: profiles, projects, tasks, proposals, achievements')

  } catch (error) {
    console.error('❌ Erro no setup:', error)
  }
}

setupDatabase()