import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://actwuuyqumsksulzkmss.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdHd1dXlxdW1za3N1bHprbXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjU5OTYsImV4cCI6MjA3MDAwMTk5Nn0.eeWR_E8aI3zTtgJSseF5FrJtvBIyHjrDvVCqRhfCOYw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para testar conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('Erro de conexão Supabase:', error)
      return false
    }

    console.log('✅ Conexão Supabase bem-sucedida!')
    return true
  } catch (err) {
    console.error('❌ Falha na conexão Supabase:', err)
    return false
  }
}