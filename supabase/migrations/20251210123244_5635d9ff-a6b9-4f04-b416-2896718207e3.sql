-- Atualizar Edilson para administrador
UPDATE profiles 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'edilson@visaobim.com';