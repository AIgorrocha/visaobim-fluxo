-- ========================================
-- CORREÇÃO PARA VIEWS E COMPLETAR SEGURANÇA
-- ========================================

-- Como task_restrictions_detailed é uma view, não podemos habilitar RLS diretamente
-- Vamos garantir que a view usa as mesmas regras da tabela base task_restrictions

-- Garantir que proposals permite operações para admin
CREATE POLICY "proposals_insert_admin" ON proposals 
FOR INSERT WITH CHECK (get_user_role_simple() = 'admin');

CREATE POLICY "proposals_update_admin" ON proposals 
FOR UPDATE USING (get_user_role_simple() = 'admin');

CREATE POLICY "proposals_delete_admin" ON proposals 
FOR DELETE USING (get_user_role_simple() = 'admin');

-- Limpar políticas antigas do achievements que podem ter ficado
DROP POLICY IF EXISTS "achievements_insert_for_system" ON achievements;
DROP POLICY IF EXISTS "achievements_update_for_system" ON achievements;
DROP POLICY IF EXISTS "achievements_select_for_users" ON achievements;