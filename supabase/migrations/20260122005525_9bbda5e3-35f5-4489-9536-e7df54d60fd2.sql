-- =====================================================
-- CORREÇÃO: Triggers de Sincronização de Pagamentos
-- =====================================================

-- 1. Criar triggers para sincronizar amount_paid automaticamente
CREATE OR REPLACE TRIGGER trigger_sync_amount_paid_insert
    AFTER INSERT ON designer_payments
    FOR EACH ROW
    EXECUTE FUNCTION sync_amount_paid();

CREATE OR REPLACE TRIGGER trigger_sync_amount_paid_update
    AFTER UPDATE ON designer_payments
    FOR EACH ROW
    EXECUTE FUNCTION sync_amount_paid();

CREATE OR REPLACE TRIGGER trigger_sync_amount_paid_delete
    AFTER DELETE ON designer_payments
    FOR EACH ROW
    EXECUTE FUNCTION sync_amount_paid();

-- 2. Vincular pagamentos órfãos ao projeto GINASIOS (SOP-GINASIOS)
UPDATE designer_payments
SET 
    project_id = '2196fb07-7126-4793-8240-a57d7a5fed15',
    project_name = 'GINASIOS - SOP/RS'
WHERE project_name ILIKE '%SOP-GINASIOS%' OR project_name ILIKE '%GINASIOS-SOP%'
  AND project_id IS NULL;

-- 3. Vincular outros pagamentos órfãos
UPDATE designer_payments dp
SET project_id = '030821d6-daa5-45a4-a74a-08b7ec36f30c'
WHERE dp.project_name ILIKE '%ZOOBOTANICO-PARQUE%' AND dp.project_id IS NULL;

UPDATE designer_payments dp
SET project_id = 'baad7c70-0f03-40b0-bea2-4a2e8d3aeb57'
WHERE dp.project_name ILIKE '%NORBERTO%' AND dp.project_id IS NULL;

UPDATE designer_payments dp
SET project_id = 'cbce33b2-e4b0-4715-a9dd-904c3bfadc08'
WHERE dp.project_name ILIKE '%ANDRE LOSS%' AND dp.project_id IS NULL;

UPDATE designer_payments dp
SET project_id = 'd3e03294-4e54-4279-8e90-474522cec221'
WHERE dp.project_name ILIKE '%ADENILSON%' AND dp.project_id IS NULL;

-- 4. Recalcular TODOS os amount_paid
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