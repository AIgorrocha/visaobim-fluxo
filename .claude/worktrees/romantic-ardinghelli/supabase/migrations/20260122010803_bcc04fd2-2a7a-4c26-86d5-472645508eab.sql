-- =====================================================
-- VINCULAR PAGAMENTOS ÓRFÃOS AOS PROJETOS CORRETOS
-- =====================================================

-- 1. FHEMIG-BH → GASES MEDICINAIS
UPDATE designer_payments
SET 
    project_id = '8f05c236-6a68-4326-84d3-bfed1e62c3dd',
    project_name = 'GASES MEDICINAIS - FHEMIG'
WHERE project_name ILIKE '%FHEMIG%' AND project_id IS NULL;

-- 2. SANTA MARIA-RS → SHOPPING INDEPENDENCIA
UPDATE designer_payments
SET 
    project_id = '5d68fb6e-1e5f-4d3d-9fd6-e5bcef8c3ca6',
    project_name = 'SHOPPING INDEPENDENCIA - PREF. SANTA MARIA/RS'
WHERE project_name ILIKE '%SANTA MARIA%' AND project_id IS NULL;

-- 3. IRIS-REFORCO EST
UPDATE designer_payments
SET project_id = '7638c70a-7a2b-4608-b7b0-b198edb584dd'
WHERE project_name ILIKE '%IRIS-REFORCO%' AND project_id IS NULL;

-- 4. GINASIOS (reforço para qualquer que tenha escapado)
UPDATE designer_payments
SET project_id = '2196fb07-7126-4793-8240-a57d7a5fed15'
WHERE project_name ILIKE '%GINASIOS%' AND project_id IS NULL;

-- 5. BRENO-CASA
UPDATE designer_payments
SET project_id = '03990012-9e4a-443d-97a6-7dc0ad5bf269'
WHERE project_name ILIKE '%BRENO%' AND project_id IS NULL;

-- 6. THALES-ROSANETE&ESEQUIAS → ROSANETE E ESEQUIAS
UPDATE designer_payments
SET project_id = 'f77079e1-5fad-46a6-861e-50896af0d627'
WHERE project_name ILIKE '%ROSANETE%' AND project_id IS NULL;

-- 7. THALES-CLEBER&IGOR
UPDATE designer_payments
SET project_id = 'b33bcd77-e2b5-4259-ad22-799fa193e0c6'
WHERE project_name ILIKE '%CLEBER%IGOR%' AND project_id IS NULL;

-- 8. THALES-GILVANDO&CARINE
UPDATE designer_payments
SET project_id = '313fb989-27c2-4518-89e6-f013960bba4f'
WHERE project_name ILIKE '%GILVANDO%CARINE%' AND project_id IS NULL;

-- 9. THALES-LAIS&SAROM → LAIS E SAROM
UPDATE designer_payments
SET project_id = '29d13dbf-33ff-4d67-ab12-c4e570dd0d71'
WHERE project_name ILIKE '%LAIS%SAROM%' AND project_id IS NULL;

-- 10. SEPOL-RJ → CIDPOL - RJ
UPDATE designer_payments
SET 
    project_id = 'db9e101e-2460-4d0f-9483-4537ba16fb63',
    project_name = 'CIDPOL - RJ - SEPOL'
WHERE project_name ILIKE '%SEPOL%' AND project_id IS NULL;

-- 11. SPRF-AL → DELEGACIA DA POLICIA RODOVIARIA FEDERAL
UPDATE designer_payments
SET project_id = '60a49d27-05d9-4e60-aa18-accffc94cca1'
WHERE project_name ILIKE '%SPRF-AL%' AND project_id IS NULL;

-- 12. SPF-RO → DELEGACIA POLICIA FEDERAL
UPDATE designer_payments
SET project_id = '04e09afb-8b45-4ab8-b6ff-8e57dd0ed0b5'
WHERE project_name ILIKE '%SPF-RO%' AND project_id IS NULL;

-- =====================================================
-- RECALCULAR amount_paid PARA TODAS AS PRECIFICAÇÕES
-- =====================================================

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
        -- Soma todos os pagamentos 'pago' para este designer+projeto
        SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
        FROM designer_payments
        WHERE designer_id = rec.designer_id
          AND project_id = rec.project_id
          AND status = 'pago';
        
        -- Soma total do designer_value para este designer+projeto
        SELECT COALESCE(SUM(designer_value), 0) INTO v_total_designer_value
        FROM project_pricing
        WHERE designer_id = rec.designer_id
          AND project_id = rec.project_id;
        
        -- Atualiza proporcionalmente cada linha de pricing
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