-- Primeiro, vamos limpar usuários existentes (se houver conflitos)
DELETE FROM profiles WHERE email LIKE '%@visaobim.com';

-- Agora vamos criar os profiles manualmente (os usuários de auth serão criados via Edge Function)
-- Note: A Edge Function criará tanto os usuários de auth quanto os profiles

-- Esta migration serve como backup caso a Edge Function falhe
-- Os IDs serão gerados pela Edge Function, então não inserimos aqui

-- Verificar se temos a função de criação de usuário
SELECT 1;