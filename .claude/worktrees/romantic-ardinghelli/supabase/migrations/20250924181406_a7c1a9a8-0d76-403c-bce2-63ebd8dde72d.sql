-- CORREÇÃO FINAL: Eliminar completamente a recursão RLS
-- Problema: As políticas ainda estão se referenciando mutuamente

-- 1. DROPAR COMPLETAMENTE a função problemática e recriar de forma mais simples
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- 2. Recriar função mais simples SEM usar RLS
CREATE OR REPLACE FUNCTION public.get_user_role_simple(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Acesso direto SEM RLS usando SECURITY DEFINER
  SELECT role FROM public.profiles WHERE id = user_uuid LIMIT 1;
$$;

-- 3. DROPAR TODAS as políticas existentes
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles; 
DROP POLICY IF EXISTS profiles_update ON public.profiles;

-- 4. RECRIAR políticas usando a nova função
CREATE POLICY profiles_select_simple ON public.profiles
FOR SELECT
USING (
  -- Usuário vê próprio perfil OU é admin (função sem recursão)
  auth.uid() = id 
  OR 
  get_user_role_simple() = 'admin'
);

CREATE POLICY profiles_insert_simple ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_simple ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id 
  OR 
  get_user_role_simple() = 'admin'
);

-- 5. ATUALIZAR outras tabelas para usar a função correta
-- PROJECTS
DROP POLICY IF EXISTS "secure_projects_select" ON projects;
CREATE POLICY secure_projects_select_fixed ON projects
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    get_user_role_simple() = 'admin' OR
    (auth.uid())::text = ANY (responsible_ids) OR
    auth.uid() = created_by
  )
);

-- TASKS
DROP POLICY IF EXISTS "secure_tasks_select" ON tasks;
CREATE POLICY secure_tasks_select_fixed ON tasks
FOR SELECT
USING (
  auth.role() = 'authenticated' AND (
    get_user_role_simple() = 'admin' OR
    (auth.uid())::text = ANY (assigned_to) OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id AND (
        (auth.uid())::text = ANY (p.responsible_ids) OR
        auth.uid() = p.created_by
      )
    )
  )
);

-- 6. TESTAR que não há mais recursão
DO $$
DECLARE
  test_role TEXT;
BEGIN
  SELECT get_user_role_simple() INTO test_role;
  
  -- Se chegou aqui, não tem recursão
  RAISE NOTICE 'SUCESSO: Função executada sem recursão. Role: %', COALESCE(test_role, 'NULL');
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'FALHA: Ainda há recursão - %', SQLERRM;
END;
$$;