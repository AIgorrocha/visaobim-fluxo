-- Fix security vulnerabilities in profiles and projects tables
-- Remove overly permissive policies that expose sensitive data

-- PROFILES TABLE SECURITY FIX
-- Remove the policy that allows ANY authenticated user to see ALL profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

-- Remove duplicate policies
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;

-- Ensure secure policies exist
-- Users can only see their own profile
CREATE POLICY "Users can view own profile only" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Admins can see all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles secure" ON profiles 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- PROJECTS TABLE SECURITY FIX  
-- Ensure no overly permissive policies exist
-- Only allow specific access patterns:
-- 1. Admins can see all projects
-- 2. Users can see projects they are assigned to
-- 3. Users can see projects they created
-- 4. Public projects can be seen by authenticated users

-- Create secure project access policy
CREATE POLICY "Secure project access" ON projects 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND (
    get_current_user_role() = 'admin' OR
    (auth.uid())::text = ANY (responsible_ids) OR
    auth.uid() = created_by OR
    (type = 'publico' AND auth.role() = 'authenticated')
  )
);

-- Remove any potentially overly permissive policies
DROP POLICY IF EXISTS "Usuários podem ver projetos públicos" ON projects;