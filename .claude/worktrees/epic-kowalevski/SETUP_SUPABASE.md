# 🗄️ SETUP SUPABASE - VISÃO BIM CRM

## 📋 INSTRUÇÕES DE CONFIGURAÇÃO

Para configurar o banco de dados Supabase, siga estas etapas **na ordem exata**:

### 1. 🌐 Acesse o Supabase Dashboard
- URL: https://actwuuyqumsksulzkmss.supabase.co
- Faça login na sua conta Supabase

### 2. 📝 Execute os Scripts SQL

Acesse **SQL Editor** no painel do Supabase e execute **na ordem**:

#### **PASSO 1:** Criar Tabelas
```sql
-- Execute o conteúdo do arquivo: sql/01_create_tables.sql
```

#### **PASSO 2:** Criar Triggers
```sql
-- Execute o conteúdo do arquivo: sql/02_create_triggers.sql
```

#### **PASSO 3:** Habilitar RLS
```sql
-- Execute o conteúdo do arquivo: sql/03_enable_rls.sql
```

#### **PASSO 4:** Criar Políticas
```sql
-- Execute o conteúdo do arquivo: sql/04_create_policies.sql
```

#### **PASSO 5:** Criar Índices
```sql
-- Execute o conteúdo do arquivo: sql/05_create_indexes.sql
```

### 3. ✅ Verificar Configuração

Após executar todos os scripts, você deve ter:

- ✅ **5 Tabelas criadas:**
  - `profiles` (usuários)
  - `projects` (projetos)
  - `tasks` (tarefas)
  - `proposals` (propostas)
  - `achievements` (conquistas)

- ✅ **RLS habilitado** em todas as tabelas
- ✅ **Políticas configuradas** (acesso total para desenvolvimento)
- ✅ **Índices criados** para performance

### 4. 🔐 Credenciais

```
Project URL: https://actwuuyqumsksulzkmss.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdHd1dXlxdW1za3N1bHprbXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjU5OTYsImV4cCI6MjA3MDAwMTk5Nn0.eeWR_E8aI3zTtgJSseF5FrJtvBIyHjrDvVCqRhfCOYw
Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdHd1dXlxdW1za3N1bHprbXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQyNTk5NiwiZXhwIjoyMDcwMDAxOTk2fQ.gAxkkXmrW_UJJllPC-17ps_MtgAZK6O0apPBEl9AXXo
```

### 5. 🎯 Próximos Passos

Após a configuração:

1. **Conectar o Frontend:** O arquivo `.env.local` já está configurado
2. **Migrar Dados:** Execute o script de migração dos dados mock
3. **Testar Conexão:** Verifique se a aplicação consegue se conectar

---

## 🚨 IMPORTANTE

- Execute os scripts **NA ORDEM CORRETA**
- Verifique se não há erros após cada execução
- As políticas RLS estão configuradas para **acesso total** durante desenvolvimento
- Para produção, ajuste as políticas conforme necessário

---

## 🔍 Estrutura das Tabelas

### PROFILES
- ID único (UUID)
- Email, nome, role (admin/user)
- Pontos e nível do usuário
- Timestamps de criação/atualização

### PROJECTS
- Informações do projeto (nome, cliente, tipo)
- Status e responsáveis
- Dados financeiros (valor, pago, pendente)
- Datas de contrato

### TASKS
- Tarefa vinculada a projeto
- Status, fase, prioridade
- Pontos e responsáveis
- Datas e comentários

### PROPOSALS
- Propostas comerciais
- Status de negociação
- Valores e datas
- Links e notas

### ACHIEVEMENTS
- Conquistas dos usuários
- Tipo e pontos ganhos
- Data de conquista