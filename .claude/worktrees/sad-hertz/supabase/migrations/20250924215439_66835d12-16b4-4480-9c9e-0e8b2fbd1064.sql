-- ========================================
-- RECALCULAR PONTOS CORRIGIDO E ATIVAR SISTEMA COMPLETO
-- ========================================

-- Executar recálculo completo de pontos para todos os usuários (nome correto da função)
SELECT recalculate_all_user_scores();

-- Atualizar alguns triggers que podem estar faltando
UPDATE profiles SET updated_at = NOW() WHERE updated_at IS NULL;