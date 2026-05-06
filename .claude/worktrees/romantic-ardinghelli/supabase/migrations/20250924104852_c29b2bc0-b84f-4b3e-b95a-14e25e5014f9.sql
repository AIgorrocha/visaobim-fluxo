-- ========================================
-- CORRIGIR FUNÇÃO E POLÍTICAS FALTANTES
-- ========================================

-- Corrigir função search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- Adicionar políticas para tasks_restricoes_backup (pode ser removida depois)
CREATE POLICY "Only authenticated users can view backup" ON tasks_restricoes_backup
FOR SELECT USING (auth.role() = 'authenticated');

-- Remover políticas duplicadas temporárias de debug
DROP POLICY IF EXISTS "Debug policy for projects" ON projects;
DROP POLICY IF EXISTS "Debug policy for tasks" ON tasks;