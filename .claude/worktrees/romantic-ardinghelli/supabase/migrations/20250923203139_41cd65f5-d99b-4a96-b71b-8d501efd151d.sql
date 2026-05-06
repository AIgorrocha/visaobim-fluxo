-- Corrigir funções sem search_path definido para segurança
ALTER FUNCTION public.contact_lead_handler(json) SET search_path = public;
ALTER FUNCTION public.newsletter_signup_handler(json) SET search_path = public;
ALTER FUNCTION public.budget_request_handler(json) SET search_path = public;