-- Inserir novos responsáveis na tabela profiles
INSERT INTO profiles (id, email, full_name, role) VALUES
  (gen_random_uuid(), 'salomao@visaobim.com', 'Salomão', 'user'),
  (gen_random_uuid(), 'arthur@visaobim.com', 'Arthur', 'user'),
  (gen_random_uuid(), 'fabio@visaobim.com', 'Fábio', 'user'),
  (gen_random_uuid(), 'lisboa@visaobim.com', 'Lisboa', 'user'),
  (gen_random_uuid(), 'fernando@visaobim.com', 'Fernando', 'user')
ON CONFLICT (email) DO NOTHING;