-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para melhorar performance das consultas
CREATE INDEX idx_projects_responsible ON projects USING GIN (responsible_ids);
CREATE INDEX idx_tasks_assigned ON tasks USING GIN (assigned_to);
CREATE INDEX idx_tasks_project ON tasks (project_id);
CREATE INDEX idx_achievements_user ON achievements (user_id);
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_proposals_status ON proposals (status);