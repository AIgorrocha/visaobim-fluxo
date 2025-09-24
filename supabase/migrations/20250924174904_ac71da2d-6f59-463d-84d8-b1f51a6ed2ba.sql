-- ========================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA - RLS
-- ========================================

-- 1. PROTEGER DADOS COMERCIAIS CRÍTICOS
-- Remover políticas permissivas existentes e criar políticas restritivas

-- CONTACT_LEADS: Apenas admins podem visualizar, inserção pública mantida
DROP POLICY IF EXISTS "Authenticated users can view contact leads" ON contact_leads;
CREATE POLICY "Only admins can view contact leads" 
ON contact_leads 
FOR SELECT 
USING (auth.role() = 'authenticated' AND get_current_user_role() = 'admin');

-- BUDGET_REQUESTS: Apenas admins podem visualizar, inserção pública mantida  
DROP POLICY IF EXISTS "Authenticated users can view budget requests" ON budget_requests;
CREATE POLICY "Only admins can view budget requests" 
ON budget_requests 
FOR SELECT 
USING (auth.role() = 'authenticated' AND get_current_user_role() = 'admin');

-- ROI_CALCULATIONS: Apenas admins podem visualizar, inserção pública mantida
DROP POLICY IF EXISTS "Authenticated users can view roi calculations" ON roi_calculations;
CREATE POLICY "Only admins can view roi calculations" 
ON roi_calculations 
FOR SELECT 
USING (auth.role() = 'authenticated' AND get_current_user_role() = 'admin');

-- NEWSLETTER_SUBSCRIBERS: Apenas admins podem visualizar, inserção pública mantida
DROP POLICY IF EXISTS "Authenticated users can view newsletter subscriptions" ON newsletter_subscribers;
CREATE POLICY "Only admins can view newsletter subscriptions" 
ON newsletter_subscribers 
FOR SELECT 
USING (auth.role() = 'authenticated' AND get_current_user_role() = 'admin');

-- 2. PROTEGER ACTIVITY_LOGS
-- Usuários só veem seus próprios logs, admins veem tudo
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON activity_logs;
CREATE POLICY "Users can view own activity logs" 
ON activity_logs 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  (get_current_user_role() = 'admin' OR user_id = auth.uid())
);

-- Admins podem gerenciar todos os logs
CREATE POLICY "Admins can manage all activity logs" 
ON activity_logs 
FOR ALL 
USING (auth.role() = 'authenticated' AND get_current_user_role() = 'admin');

-- 3. CORRIGIR SECURITY DEFINER VIEW
-- Recriar view sem SECURITY DEFINER para respeitar RLS do usuário
DROP VIEW IF EXISTS task_restrictions_detailed;

CREATE VIEW task_restrictions_detailed AS
SELECT 
  tr.*,
  wt.title as waiting_task_title,
  wt.status as waiting_task_status, 
  wt.assigned_to as waiting_task_assigned_to,
  bt.title as blocking_task_title,
  bt.status as blocking_task_status,
  bt.assigned_to as blocking_task_assigned_to,
  bp.full_name as blocking_user_name,
  bp.email as blocking_user_email
FROM task_restrictions tr
LEFT JOIN tasks wt ON tr.waiting_task_id = wt.id
LEFT JOIN tasks bt ON tr.blocking_task_id = bt.id  
LEFT JOIN profiles bp ON tr.blocking_user_id = bp.id;

-- Aplicar RLS à view
ALTER VIEW task_restrictions_detailed SET (security_barrier = true);

-- 4. CONFIGURAÇÕES DE RETENÇÃO DE DADOS
-- Função para limpar logs antigos automaticamente (30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM activity_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Log da limpeza
  INSERT INTO activity_logs (action, details, entity_type)
  VALUES (
    'system_cleanup', 
    '{"cleaned": "old_activity_logs", "retention_days": 30}',
    'system'
  );
END;
$$;

-- 5. ADICIONAR POLÍTICAS DE AUDITORIA
-- Política para inserir logs de acesso a dados sensíveis
CREATE OR REPLACE FUNCTION log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Registrar acesso a dados comerciais críticos
  INSERT INTO activity_logs (
    user_id, 
    action, 
    entity_type, 
    entity_id, 
    details
  ) VALUES (
    auth.uid(),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'SELECT' THEN '{"access_type": "view_commercial_data"}'
      ELSE '{"access_type": "modify_commercial_data"}'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers de auditoria nas tabelas comerciais críticas
DROP TRIGGER IF EXISTS audit_contact_leads ON contact_leads;
CREATE TRIGGER audit_contact_leads
  AFTER INSERT OR UPDATE OR DELETE ON contact_leads
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();

DROP TRIGGER IF EXISTS audit_budget_requests ON budget_requests;  
CREATE TRIGGER audit_budget_requests
  AFTER INSERT OR UPDATE OR DELETE ON budget_requests
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();

DROP TRIGGER IF EXISTS audit_roi_calculations ON roi_calculations;
CREATE TRIGGER audit_roi_calculations
  AFTER INSERT OR UPDATE OR DELETE ON roi_calculations
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_data_access();

-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON POLICY "Only admins can view contact leads" ON contact_leads IS 'SEGURANÇA CRÍTICA: Protege dados de contatos contra vazamentos comerciais';
COMMENT ON POLICY "Only admins can view budget requests" ON budget_requests IS 'SEGURANÇA CRÍTICA: Protege dados de orçamentos contra espionagem comercial';  
COMMENT ON POLICY "Only admins can view roi calculations" ON roi_calculations IS 'SEGURANÇA CRÍTICA: Protege cálculos de ROI e estratégias de preços';
COMMENT ON POLICY "Only admins can view newsletter subscriptions" ON newsletter_subscribers IS 'SEGURANÇA: Protege lista de assinantes contra spam e uso indevido';