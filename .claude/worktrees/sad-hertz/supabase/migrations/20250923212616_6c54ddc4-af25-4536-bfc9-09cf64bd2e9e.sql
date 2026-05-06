-- Migrar os 3 projetos incorretos para a tabela de propostas
INSERT INTO public.proposals (
  id,
  client_name,
  proposal_date,
  proposal_value,
  status,
  notes,
  created_by,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  client as client_name,
  contract_start as proposal_date,
  project_value as proposal_value,
  CASE 
    WHEN status = 'FINALIZADO' THEN 'aprovada'
    WHEN status = 'EM_ANDAMENTO' THEN 'pendente'
    ELSE 'pendente'
  END as status,
  description as notes,
  created_by,
  created_at,
  updated_at
FROM public.projects 
WHERE name IN (
  'Residência Moderna Alphaville',
  'Edifício Comercial Centro', 
  'Casa de Campo Gramado'
);

-- Soft delete dos projetos migrados
UPDATE public.projects 
SET is_archived = true 
WHERE name IN (
  'Residência Moderna Alphaville',
  'Edifício Comercial Centro',
  'Casa de Campo Gramado'
);