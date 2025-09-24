# Instruções para Aplicar Sistema de Restrições no Supabase

## 📋 Passo a Passo para Implementação

### 1. **Executar Migração SQL no Supabase**

Acesse o painel do Supabase (https://app.supabase.com) e execute o SQL da migração:

```sql
-- 🚀 Execute este SQL no Editor SQL do Supabase
-- Arquivo: /supabase/migrations/create_task_restrictions.sql

-- 1. Criar tabela de restrições/dependências entre tarefas
CREATE TABLE IF NOT EXISTS task_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  waiting_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  blocking_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  restriction_description TEXT NOT NULL,
  blocking_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(waiting_task_id, blocking_task_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_task_restrictions_waiting_task ON task_restrictions(waiting_task_id);
CREATE INDEX IF NOT EXISTS idx_task_restrictions_blocking_task ON task_restrictions(blocking_task_id);
CREATE INDEX IF NOT EXISTS idx_task_restrictions_blocking_user ON task_restrictions(blocking_user_id);
CREATE INDEX IF NOT EXISTS idx_task_restrictions_status ON task_restrictions(status);

-- 3. Trigger para atualizar updated_at
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

-- 4. Habilitar RLS
ALTER TABLE task_restrictions ENABLE ROW LEVEL SECURITY;

-- 5. Policies de segurança
CREATE POLICY "Users can view task restrictions for their tasks" ON task_restrictions
  FOR SELECT USING (
    waiting_task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()::text
      OR assigned_to::jsonb ? auth.uid()::text
    )
    OR
    blocking_task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()::text
      OR assigned_to::jsonb ? auth.uid()::text
    )
    OR
    blocking_user_id = auth.uid()
  );

CREATE POLICY "Users can create task restrictions for their tasks" ON task_restrictions
  FOR INSERT WITH CHECK (
    waiting_task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()::text
      OR assigned_to::jsonb ? auth.uid()::text
    )
  );

CREATE POLICY "Users can update task restrictions for their tasks" ON task_restrictions
  FOR UPDATE USING (
    waiting_task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()::text
      OR assigned_to::jsonb ? auth.uid()::text
    )
    OR
    blocking_user_id = auth.uid()
  );

CREATE POLICY "Users can delete task restrictions for their tasks" ON task_restrictions
  FOR DELETE USING (
    waiting_task_id IN (
      SELECT id FROM tasks WHERE assigned_to = auth.uid()::text
      OR assigned_to::jsonb ? auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage all task restrictions" ON task_restrictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Função para resolver automaticamente restrições
CREATE OR REPLACE FUNCTION auto_resolve_task_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONCLUIDA' AND OLD.status != 'CONCLUIDA' THEN
    UPDATE task_restrictions
    SET
      status = 'resolved',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE
      blocking_task_id = NEW.id
      AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para resolver automaticamente restrições
CREATE TRIGGER auto_resolve_restrictions_on_task_completion
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_resolve_task_restrictions();

-- 8. View para consultas detalhadas
CREATE OR REPLACE VIEW task_restrictions_detailed AS
SELECT
  tr.id,
  tr.waiting_task_id,
  tr.blocking_task_id,
  tr.restriction_description,
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
```

### 2. **Configurar Variáveis de Ambiente** (opcional)

Se ainda não estiver configurado, adicione no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://kfwqjlokyealnkiqnnsc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmd3FqbG9reWVhbG5raXFubnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjYzMjcsImV4cCI6MjA3MDAwMjMyN30.uHW0nQL2hDNKcnp313TtFglTHq0pmuEhGvjDDQzBho4
```

### 3. **Verificar Tabelas Criadas**

Após executar o SQL, verifique no painel do Supabase:
- ✅ Tabela `task_restrictions` criada
- ✅ Índices aplicados
- ✅ Policies RLS configuradas
- ✅ Triggers funcionando
- ✅ View `task_restrictions_detailed` disponível

## 🔧 Como Usar o Sistema

### **No Frontend (React)**

1. **Editar uma Tarefa**:
   - Abra uma tarefa existente em modo edição
   - Role até a seção "Restrições da Tarefa"
   - Adicione dependências selecionando tarefas bloqueantes

2. **Controle de Início**:
   - Botão "▶️ Iniciar Hoje" só aparece se não há restrições ativas
   - Se há restrições, aparece "🔒 Bloqueada"

3. **Notificações**:
   - Ícone de sino no canto superior direito
   - Mostra quando tarefas são liberadas
   - Atualiza automaticamente a cada 30 segundos

### **Fluxo Automático**

1. **Usuário A** cria restrição: "Aguardando projeto arquitetônico do Igor"
2. **Igor** finaliza sua tarefa (marca como CONCLUÍDA)
3. **Sistema automaticamente**:
   - Resolve a restrição (status → 'resolved')
   - Libera a tarefa do Usuário A
   - Envia notificação para Usuário A
4. **Usuário A** recebe notificação e pode iniciar a tarefa

## 📊 Estrutura da Tabela

```sql
task_restrictions:
├── id (UUID) - Chave primária
├── waiting_task_id (UUID) - Tarefa que está aguardando
├── blocking_task_id (UUID) - Tarefa que está bloqueando
├── restriction_description (TEXT) - Descrição da restrição
├── blocking_user_id (UUID) - Usuário responsável pela tarefa bloqueante
├── status ('active' | 'resolved' | 'cancelled')
├── created_at (TIMESTAMP)
├── resolved_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🚨 Importante

- **Backup**: Faça backup do banco antes de executar
- **Testes**: Teste em ambiente de desenvolvimento primeiro
- **Permissions**: Verifique se as policies RLS estão funcionando corretamente
- **Performance**: Os índices garantem consultas rápidas mesmo com muitas restrições

## ✅ Próximos Passos

Após aplicar a migração:
1. Reinicie o sistema React
2. Teste criando uma tarefa com restrições
3. Teste o fluxo de liberação automática
4. Verifique as notificações

O sistema está pronto para uso! 🎉