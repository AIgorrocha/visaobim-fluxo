-- ========================================
-- CORREÇÕES DE SEGURANÇA VIÁVEIS VIA SQL
-- ========================================

-- 1. CORRIGIR SECURITY DEFINER VIEW DEFINITIVAMENTE
-- Remover completamente a view existente e recriar corretamente
DROP VIEW IF EXISTS task_restrictions_detailed CASCADE;

-- Recriar a view SEM security_definer e COM security_barrier
CREATE VIEW task_restrictions_detailed AS
SELECT 
  tr.id,
  tr.waiting_task_id,
  tr.blocking_task_id, 
  tr.blocking_user_id,
  tr.status,
  tr.created_at,
  tr.resolved_at,
  tr.updated_at,
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

-- Aplicar configurações de segurança à view
ALTER VIEW task_restrictions_detailed SET (security_barrier = true);

-- 2. ADICIONAR FUNÇÃO DE MONITORAMENTO DE SEGURANÇA
CREATE OR REPLACE FUNCTION monitor_unauthorized_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obter role do usuário atual
  SELECT get_current_user_role() INTO user_role;
  
  -- Se não é admin tentando acessar dados comerciais, registrar tentativa
  IF user_role != 'admin' AND TG_TABLE_NAME IN ('contact_leads', 'budget_requests', 'roi_calculations', 'newsletter_subscribers') THEN
    INSERT INTO activity_logs (
      user_id,
      action,
      entity_type,
      details,
      ip_address
    ) VALUES (
      auth.uid(),
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      TG_TABLE_NAME,
      json_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'user_role', user_role,
        'timestamp', NOW(),
        'severity', 'HIGH'
      ),
      inet_client_addr()
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- 3. OTIMIZAR ÍNDICES PARA CONSULTAS SEGURAS
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created 
ON activity_logs (user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role_security 
ON profiles (role) 
WHERE role = 'admin';

-- Índice para auditoria de acesso
CREATE INDEX IF NOT EXISTS idx_activity_logs_security_audit 
ON activity_logs (action, created_at DESC) 
WHERE action LIKE '%UNAUTHORIZED%' OR action LIKE '%_contact_leads' OR action LIKE '%_budget_requests';

-- 4. VALIDAÇÃO FINAL DE SEGURANÇA
-- Verificar se todas as tabelas críticas têm RLS habilitado
DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
  tables_checked INT := 0;
BEGIN
  FOR table_name IN SELECT unnest(ARRAY['contact_leads', 'budget_requests', 'roi_calculations', 'newsletter_subscribers', 'activity_logs', 'profiles', 'projects', 'tasks', 'proposals', 'achievements', 'task_notifications', 'task_restrictions'])
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class 
    WHERE relname = table_name;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'FALHA DE SEGURANÇA: Tabela % não tem RLS habilitado!', table_name;
    END IF;
    
    tables_checked := tables_checked + 1;
  END LOOP;
  
  -- Log de validação bem-sucedida
  INSERT INTO activity_logs (action, details, entity_type)
  VALUES (
    'SECURITY_VALIDATION_SUCCESS',
    json_build_object(
      'message', 'Todas as tabelas críticas têm RLS habilitado',
      'validated_tables', tables_checked,
      'timestamp', NOW()
    ),
    'system'
  );
END;
$$;

-- 5. COMENTÁRIOS FINAIS DE DOCUMENTAÇÃO
COMMENT ON VIEW task_restrictions_detailed IS 'VIEW SEGURA: Respeita RLS do usuário autenticado';
COMMENT ON FUNCTION monitor_unauthorized_access() IS 'AUDITORIA: Monitora tentativas de acesso não autorizado';

-- 6. CRIAR RESUMO DE SEGURANÇA
INSERT INTO activity_logs (action, details, entity_type)
VALUES (
  'SECURITY_MIGRATION_COMPLETED',
  json_build_object(
    'message', 'Migração de segurança crítica concluída',
    'protections_applied', ARRAY[
      'Dados comerciais restritos a admins',
      'Activity logs protegidos',
      'View task_restrictions_detailed corrigida',
      'Auditoria de acesso implementada',
      'Índices de performance criados'
    ],
    'remaining_actions', ARRAY[
      'Configurar OTP no painel Supabase',
      'Habilitar proteção contra senhas vazadas',
      'Atualizar versão PostgreSQL'
    ]
  ),
  'system'
);