-- 1. Criar 4 projetos finalizados
INSERT INTO projects (id, name, client, type, status)
VALUES 
  (gen_random_uuid(), 'UNESPAR - ESTRUTURA METÁLICA', 'UNESPAR/PR', 'publico', 'FINALIZADO'),
  (gen_random_uuid(), 'ZOOTECNIA-USP', 'USP', 'publico', 'FINALIZADO'),
  (gen_random_uuid(), 'CIAP-SP', 'CIAP', 'publico', 'FINALIZADO'),
  (gen_random_uuid(), 'IBC-RJ', 'IBC', 'publico', 'FINALIZADO');

-- 2. Vincular pagamentos órfãos a projetos existentes/novos
UPDATE designer_payments
SET project_id = 'b940baaf-1bab-481d-925a-98d2479bf334'
WHERE project_name ILIKE '%CARVALHO-PORTAL%' AND project_id IS NULL;

UPDATE designer_payments
SET project_id = (SELECT id FROM projects WHERE name = 'UNESPAR - ESTRUTURA METÁLICA')
WHERE project_name ILIKE '%UNESPAR-EST%' AND project_id IS NULL;

UPDATE designer_payments
SET project_id = (SELECT id FROM projects WHERE name = 'ZOOTECNIA-USP')
WHERE project_name ILIKE '%ZOOTECNIA%' AND project_id IS NULL;

UPDATE designer_payments
SET project_id = (SELECT id FROM projects WHERE name = 'CIAP-SP')
WHERE project_name ILIKE '%CIAP%' AND project_id IS NULL;

UPDATE designer_payments
SET project_id = (SELECT id FROM projects WHERE name = 'IBC-RJ')
WHERE project_name ILIKE '%IBC%' AND project_id IS NULL;

-- 3. Recalcular amount_paid globalmente no project_pricing
DO $$
DECLARE
    rec RECORD;
    v_total_paid NUMERIC;
    v_total_designer_value NUMERIC;
BEGIN
    FOR rec IN 
        SELECT DISTINCT designer_id, project_id 
        FROM project_pricing 
        WHERE designer_id IS NOT NULL AND project_id IS NOT NULL
    LOOP
        SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
        FROM designer_payments
        WHERE designer_id = rec.designer_id
          AND project_id = rec.project_id
          AND status = 'pago';
        
        SELECT COALESCE(SUM(designer_value), 0) INTO v_total_designer_value
        FROM project_pricing
        WHERE designer_id = rec.designer_id
          AND project_id = rec.project_id;
        
        UPDATE project_pricing pp
        SET amount_paid = CASE 
            WHEN v_total_designer_value > 0 THEN 
                ROUND((pp.designer_value / v_total_designer_value) * v_total_paid, 2)
            ELSE 0 
        END
        WHERE pp.designer_id = rec.designer_id
          AND pp.project_id = rec.project_id;
    END LOOP;
END $$;