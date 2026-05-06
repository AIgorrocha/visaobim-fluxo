-- 1. Mover pagamento do Salomão para o projeto correto
UPDATE designer_payments
SET 
    project_id = '80deac2b-928f-4177-ab77-984d76944b06',
    project_name = 'REFORÇO COLEGIO - SOP'
WHERE id = 'a6cf3482-a029-4465-be67-1ca218c4c4a6';

-- 2. Atualizar amount_paid na precificação do Salomão
UPDATE project_pricing
SET 
    amount_paid = 1500.00,
    status = 'parcial'
WHERE id = '6c2cccca-07c1-4630-8657-1ab2040f6bbc';

-- 3. Deletar projeto duplicado SOP-REFORÇO (sem precificações)
DELETE FROM projects 
WHERE id = '0cb81239-4c10-4949-8571-a584327b0609';