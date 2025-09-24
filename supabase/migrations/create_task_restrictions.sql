-- 🚀 Execute este SQL no Editor SQL do Supabase
-- Sistema completo de restrições de tarefas com notificações

-- 1. Remover tabelas existentes se houver (opcional - descomente se necessário)
-- DROP TABLE IF EXISTS task_notifications CASCADE;
-- DROP TABLE IF EXISTS task_restrictions CASCADE;

-- 2. Criar tabela de restrições/dependências entre tarefas
CREATE TABLE IF NOT EXISTS task_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  waiting_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  blocking_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  blocking_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(waiting_task_id, blocking_task_id)
);

-- 3. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS task_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_released', 'restriction_added', 'task_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_task_restrictions_waiting_task ON task_restrictions(waiting_task_id);
CREATE INDEX IF NOT EXISTS idx_task_restrictions_blocking_task ON task_restrictions(blocking_task_id);
CREATE INDEX IF NOT EXISTS idx_task_restrictions_blocking_user ON task_restrictions(blocking_user_id);
CREATE INDEX IF NOT EXISTS idx_task_restrictions_status ON task_restrictions(status);

CREATE INDEX IF NOT EXISTS idx_task_notifications_user ON task_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_task ON task_notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_read ON task_notifications(read);
CREATE INDEX IF NOT EXISTS idx_task_notifications_created ON task_notifications(created_at);

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_task_restrictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_restrictions_updated_at
  BEFORE UPDATE ON task_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION update_task_restrictions_updated_at();

-- 6. Habilitar RLS
ALTER TABLE task_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;

-- 7. Policies de segurança para task_restrictions (usando text[] array)
CREATE POLICY "Users can view task restrictions for their tasks" ON task_restrictions
  FOR SELECT USING (
    waiting_task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid()::text = ANY(assigned_to)
    )
    OR
    blocking_task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid()::text = ANY(assigned_to)
    )
    OR
    blocking_user_id = auth.uid()
  );

CREATE POLICY "Users can create task restrictions for their tasks" ON task_restrictions
  FOR INSERT WITH CHECK (
    waiting_task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid()::text = ANY(assigned_to)
    )
  );

CREATE POLICY "Users can update task restrictions for their tasks" ON task_restrictions
  FOR UPDATE USING (
    waiting_task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid()::text = ANY(assigned_to)
    )
    OR
    blocking_user_id = auth.uid()
  );

CREATE POLICY "Users can delete task restrictions for their tasks" ON task_restrictions
  FOR DELETE USING (
    waiting_task_id IN (
      SELECT id FROM tasks
      WHERE auth.uid()::text = ANY(assigned_to)
    )
  );

CREATE POLICY "Admins can manage all task restrictions" ON task_restrictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Policies de segurança para task_notifications
CREATE POLICY "Users can view their own notifications" ON task_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON task_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON task_notifications
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON task_notifications
  FOR INSERT WITH CHECK (true);

-- 9. Função para resolver automaticamente restrições
CREATE OR REPLACE FUNCTION auto_resolve_task_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONCLUIDA' AND OLD.status != 'CONCLUIDA' THEN
    -- Resolver restrições
    UPDATE task_restrictions
    SET
      status = 'resolved',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE
      blocking_task_id = NEW.id
      AND status = 'active';

    -- Criar notificações para usuários das tarefas liberadas
    INSERT INTO task_notifications (user_id, task_id, type, title, message)
    SELECT DISTINCT
      unnest(t.assigned_to)::uuid as user_id,
      t.id as task_id,
      'task_released' as type,
      'Tarefa Liberada! 🎉' as title,
      'A tarefa "' || t.title || '" foi liberada e pode ser iniciada.' as message
    FROM tasks t
    WHERE t.id IN (
      SELECT tr.waiting_task_id
      FROM task_restrictions tr
      WHERE tr.blocking_task_id = NEW.id
      AND tr.status = 'resolved'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para resolver automaticamente restrições
CREATE TRIGGER auto_resolve_restrictions_on_task_completion
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_resolve_task_restrictions();

-- 11. Função para criar notificação quando restrição é adicionada
CREATE OR REPLACE FUNCTION notify_restriction_added()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar o usuário responsável pela tarefa bloqueante
  INSERT INTO task_notifications (user_id, task_id, type, title, message)
  VALUES (
    NEW.blocking_user_id,
    NEW.blocking_task_id,
    'restriction_added',
    'Nova Dependência',
    'Uma tarefa está aguardando a conclusão de "' ||
    (SELECT title FROM tasks WHERE id = NEW.blocking_task_id) || '".'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_restriction_added
  AFTER INSERT ON task_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION notify_restriction_added();

-- 12. View para consultas detalhadas
CREATE OR REPLACE VIEW task_restrictions_detailed AS
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
JOIN tasks wt ON tr.waiting_task_id = wt.id
JOIN tasks bt ON tr.blocking_task_id = bt.id
JOIN profiles bp ON tr.blocking_user_id = bp.id;

-- 13. Função para limpeza de notificações antigas (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM task_notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND read = true;
END;
$$ LANGUAGE plpgsql;

-- Comentários finais:
-- ✅ Tabelas criadas com relacionamentos corretos
-- ✅ Índices para performance otimizada
-- ✅ RLS policies configuradas para segurança
-- ✅ Triggers automáticos para resolver restrições
-- ✅ Sistema de notificações integrado
-- ✅ View para consultas complexas
-- ✅ Função de limpeza de notificações antigas