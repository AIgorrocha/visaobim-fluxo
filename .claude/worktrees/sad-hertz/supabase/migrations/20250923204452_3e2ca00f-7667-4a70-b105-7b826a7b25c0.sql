-- ========================================
-- SECURITY FIX: REMOVE PROBLEMATIC PUBLIC POLICIES
-- ========================================

-- Drop problematic policies that allow public access to sensitive data
DROP POLICY IF EXISTS "Permite inserção de novos profiles" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio profile" ON profiles;
DROP POLICY IF EXISTS "Permite inserção de activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Todos podem ver activity_logs" ON activity_logs;

-- Drop and recreate policies for public form tables to ensure proper security
-- Budget requests
DROP POLICY IF EXISTS "Allow all for anon" ON budget_requests;
DROP POLICY IF EXISTS "Allow anonymous budget inserts" ON budget_requests;
DROP POLICY IF EXISTS "Only authenticated can view budgets" ON budget_requests;
DROP POLICY IF EXISTS "budget_insert_anon" ON budget_requests;
DROP POLICY IF EXISTS "budget_select_authenticated" ON budget_requests;

CREATE POLICY "Public can insert budget requests" ON budget_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view budget requests" ON budget_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Contact leads
DROP POLICY IF EXISTS "Allow all for anon" ON contact_leads;
DROP POLICY IF EXISTS "Allow anonymous contact inserts" ON contact_leads;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_leads;
DROP POLICY IF EXISTS "Only authenticated can view contacts" ON contact_leads;
DROP POLICY IF EXISTS "contact_insert_anon" ON contact_leads;
DROP POLICY IF EXISTS "contact_select_authenticated" ON contact_leads;

CREATE POLICY "Public can insert contact leads" ON contact_leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view contact leads" ON contact_leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Newsletter subscribers
DROP POLICY IF EXISTS "Allow all for anon" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anonymous newsletter inserts" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Only authenticated can view newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_insert_anon" ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_select_authenticated" ON newsletter_subscribers;

CREATE POLICY "Public can insert newsletter subscriptions" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view newsletter subscriptions" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- ROI calculations
DROP POLICY IF EXISTS "Allow all for anon" ON roi_calculations;
DROP POLICY IF EXISTS "Allow anonymous roi inserts" ON roi_calculations;
DROP POLICY IF EXISTS "Only authenticated can view roi" ON roi_calculations;
DROP POLICY IF EXISTS "roi_insert_anon" ON roi_calculations;
DROP POLICY IF EXISTS "roi_select_authenticated" ON roi_calculations;

CREATE POLICY "Public can insert roi calculations" ON roi_calculations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view roi calculations" ON roi_calculations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Activity logs: Secure policies
CREATE POLICY "Authenticated users can view activity logs" ON activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    (user_id = auth.uid() OR user_id IS NULL)
  );