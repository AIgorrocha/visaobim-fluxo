-- 1. Atualizar status das precificações baseado nos valores reais
UPDATE project_pricing
SET status = CASE
    WHEN COALESCE(amount_paid, 0) >= designer_value THEN 'pago'
    WHEN COALESCE(amount_paid, 0) > 0 THEN 'parcial'
    ELSE 'pendente'
END
WHERE designer_id IS NOT NULL;

-- 2. Limitar amount_paid ao designer_value (evitar saldo negativo)
UPDATE project_pricing
SET amount_paid = designer_value
WHERE amount_paid > designer_value
  AND designer_id IS NOT NULL;

-- 3. Recriar view designer_receivables com proteção contra valores negativos
DROP VIEW IF EXISTS designer_receivables;

CREATE VIEW designer_receivables AS
SELECT 
    pp.designer_id,
    p.full_name AS designer_name,
    pr.id AS project_id,
    pr.name AS project_name,
    pp.discipline_name,
    pp.total_value,
    pp.designer_percentage,
    pp.designer_value,
    LEAST(COALESCE(pp.amount_paid, 0), pp.designer_value) AS amount_paid,
    GREATEST(pp.designer_value - COALESCE(pp.amount_paid, 0), 0) AS amount_pending,
    pp.status
FROM project_pricing pp
LEFT JOIN profiles p ON p.id = pp.designer_id
LEFT JOIN projects pr ON pr.id = pp.project_id
WHERE pp.designer_id IS NOT NULL;