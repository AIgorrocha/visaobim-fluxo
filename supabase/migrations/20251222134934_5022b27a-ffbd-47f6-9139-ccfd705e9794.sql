-- Criar trigger que executa auto_resolve_task_restrictions quando uma tarefa é atualizada
CREATE TRIGGER trigger_auto_resolve_restrictions
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_resolve_task_restrictions();