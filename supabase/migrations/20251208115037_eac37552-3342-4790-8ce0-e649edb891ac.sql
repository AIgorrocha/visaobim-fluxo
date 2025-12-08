-- Remover constraint antiga de status
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Adicionar nova constraint com AGUARDANDO_APROVACAO
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'EM_ESPERA', 'PARALISADO', 'CONCLUIDO', 'AGUARDANDO_PAGAMENTO', 'AGUARDANDO_APROVACAO'));

-- Adicionar coluna ART
ALTER TABLE projects ADD COLUMN IF NOT EXISTS art_emitida BOOLEAN DEFAULT false;