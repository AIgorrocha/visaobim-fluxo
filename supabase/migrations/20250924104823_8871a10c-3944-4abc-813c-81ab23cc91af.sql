-- ========================================
-- CORRIGIR RLS NAS TABELAS FALTANTES
-- ========================================

-- Habilitar RLS em todas as tabelas que faltam
ALTER TABLE IF EXISTS contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budget_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks_restricoes_backup ENABLE ROW LEVEL SECURITY;

-- Verificar se todas as tabelas têm RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;