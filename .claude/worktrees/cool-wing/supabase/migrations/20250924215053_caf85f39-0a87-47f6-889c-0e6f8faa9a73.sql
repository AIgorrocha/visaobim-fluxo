-- ========================================
-- CORRIGIR WARNINGS DE SEGURANÇA
-- ========================================

-- 1. Recriar políticas para achievements (foi removida na migração anterior)
CREATE POLICY "achievements_select_own_or_admin" ON achievements 
FOR SELECT USING (
    user_id = auth.uid() OR 
    get_user_role_simple() = 'admin'
);

CREATE POLICY "achievements_insert_admin" ON achievements 
FOR INSERT WITH CHECK (get_user_role_simple() = 'admin');

CREATE POLICY "achievements_update_admin" ON achievements 
FOR UPDATE USING (get_user_role_simple() = 'admin');