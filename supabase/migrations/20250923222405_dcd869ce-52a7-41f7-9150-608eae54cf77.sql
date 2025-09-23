-- Migração para melhorar o campo restricoes da tabela tasks
-- Converter de text para jsonb para melhor performance e funcionalidade

-- Backup dos dados atuais
CREATE TABLE IF NOT EXISTS tasks_restricoes_backup AS 
SELECT id, restricoes 
FROM tasks 
WHERE restricoes IS NOT NULL AND restricoes != '';

-- Atualizar a coluna para aceitar jsonb
ALTER TABLE tasks 
ALTER COLUMN restricoes TYPE jsonb 
USING CASE 
  WHEN restricoes IS NULL OR restricoes = '' THEN NULL
  WHEN restricoes::text ~ '^\[.*\]$' THEN restricoes::jsonb
  ELSE ('["' || restricoes || '"]')::jsonb
END;

-- Comentário para documentar a mudança
COMMENT ON COLUMN tasks.restricoes IS 'Array JSON de user IDs que devem concluir suas tarefas antes desta ser liberada';