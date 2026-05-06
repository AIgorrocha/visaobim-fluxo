-- Unificar status FINALIZADO para CONCLUIDO
UPDATE projects 
SET status = 'CONCLUIDO' 
WHERE status = 'FINALIZADO';