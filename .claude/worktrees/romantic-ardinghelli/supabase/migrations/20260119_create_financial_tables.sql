-- ========================================
-- SISTEMA FINANCEIRO DE PROJETISTAS
-- Migração para criar tabelas financeiras
-- ========================================

-- 1. TABELA DE DISCIPLINAS (lista de referência)
CREATE TABLE IF NOT EXISTS disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir disciplinas padrão
INSERT INTO disciplines (name, description, display_order) VALUES
('ESTRUTURAL', 'Projeto Estrutural', 1),
('ELETRICO', 'Projeto Elétrico, Lógica, Telefone, CFTV', 2),
('HIDROSSANITARIO', 'Projeto Hidrossanitário', 3),
('INCENDIO', 'Combate a Incêndio', 4),
('CLIMATIZACAO', 'Climatização, Renovação, PMOC', 5),
('ARQUITETURA', 'Arquitetônico, Acessibilidade, Interiores', 6),
('ORCAMENTO', 'Orçamento, Memória, Composições', 7),
('CONSTRUCAO_VIRTUAL', 'Modelagem e Construção Virtual', 8),
('ESTRUTURAS_METALICAS', 'Estruturas Metálicas', 9),
('TERRAPLENAGEM', 'Terraplenagem e Implantação', 10),
('PAISAGISMO', 'Projeto de Paisagismo', 11),
('GASES', 'Gases Medicinais', 12),
('SPDA', 'Sistema de Proteção contra Descargas Atmosféricas', 13)
ON CONFLICT (name) DO NOTHING;

-- 2. TABELA DE PRECIFICAÇÃO DE PROJETOS (define quanto cada disciplina vale em cada projeto)
CREATE TABLE IF NOT EXISTS project_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id),
  discipline_name TEXT NOT NULL,
  total_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  designer_percentage DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  designer_value DECIMAL(12,2) GENERATED ALWAYS AS (total_value * designer_percentage / 100) STORED,
  designer_id UUID REFERENCES profiles(id),
  amount_paid DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'parcial', 'pago')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(project_id, discipline_name)
);

-- 3. TABELA DE PAGAMENTOS DE PROJETISTAS (histórico de pagamentos realizados)
CREATE TABLE IF NOT EXISTS designer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  project_name TEXT,
  pricing_id UUID REFERENCES project_pricing(id) ON DELETE SET NULL,
  designer_id UUID NOT NULL REFERENCES profiles(id),
  discipline TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  sector TEXT CHECK (sector IN ('privado', 'publico')),
  invoice_number TEXT,
  contract_reference TEXT,
  status TEXT DEFAULT 'pago' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_project_pricing_project ON project_pricing(project_id);
CREATE INDEX IF NOT EXISTS idx_project_pricing_designer ON project_pricing(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_payments_designer ON designer_payments(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_payments_project ON designer_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_designer_payments_date ON designer_payments(payment_date);

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================

-- Habilitar RLS nas tabelas
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_payments ENABLE ROW LEVEL SECURITY;

-- DISCIPLINES - Todos autenticados podem ver
CREATE POLICY "Authenticated users can view disciplines" ON disciplines
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage disciplines" ON disciplines
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PROJECT_PRICING - Projetistas veem suas próprias atribuições, Admin vê tudo
CREATE POLICY "Users see own pricing assignments" ON project_pricing
  FOR SELECT TO authenticated USING (
    designer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage all pricing" ON project_pricing
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DESIGNER_PAYMENTS - Projetistas veem seus próprios pagamentos, Admin vê tudo
CREATE POLICY "Users see own payments" ON designer_payments
  FOR SELECT TO authenticated USING (
    designer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins manage all payments" ON designer_payments
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para project_pricing
DROP TRIGGER IF EXISTS update_project_pricing_updated_at ON project_pricing;
CREATE TRIGGER update_project_pricing_updated_at
    BEFORE UPDATE ON project_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para designer_payments
DROP TRIGGER IF EXISTS update_designer_payments_updated_at ON designer_payments;
CREATE TRIGGER update_designer_payments_updated_at
    BEFORE UPDATE ON designer_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ========================================

-- View para resumo financeiro por projetista
CREATE OR REPLACE VIEW designer_financial_summary AS
SELECT
  dp.designer_id,
  p.full_name as designer_name,
  p.email as designer_email,
  COUNT(DISTINCT dp.id) as total_payments,
  SUM(CASE WHEN dp.status = 'pago' THEN dp.amount ELSE 0 END) as total_received,
  SUM(CASE WHEN dp.status = 'pendente' THEN dp.amount ELSE 0 END) as total_pending,
  COUNT(DISTINCT dp.project_id) as projects_count,
  MAX(dp.payment_date) as last_payment_date
FROM designer_payments dp
LEFT JOIN profiles p ON p.id = dp.designer_id
WHERE dp.status != 'cancelado'
GROUP BY dp.designer_id, p.full_name, p.email;

-- View para valores a receber por projetista
CREATE OR REPLACE VIEW designer_receivables AS
SELECT
  pp.designer_id,
  p.full_name as designer_name,
  pr.id as project_id,
  pr.name as project_name,
  pp.discipline_name,
  pp.total_value,
  pp.designer_percentage,
  pp.designer_value,
  COALESCE(pp.amount_paid, 0) as amount_paid,
  (pp.designer_value - COALESCE(pp.amount_paid, 0)) as amount_pending,
  pp.status
FROM project_pricing pp
LEFT JOIN profiles p ON p.id = pp.designer_id
LEFT JOIN projects pr ON pr.id = pp.project_id
WHERE pp.designer_id IS NOT NULL
  AND (pp.designer_value - COALESCE(pp.amount_paid, 0)) > 0;

-- Grant para as views
GRANT SELECT ON designer_financial_summary TO authenticated;
GRANT SELECT ON designer_receivables TO authenticated;
