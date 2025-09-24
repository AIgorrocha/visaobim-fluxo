import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )

    const users = [
      // ADMINS
      { email: 'igor@visaobim.com', password: 'admigor@2025', full_name: 'Igor Santos', role: 'admin' },
      { email: 'stael@visaobim.com', password: 'admstael@2025', full_name: 'Stael Silva', role: 'admin' },
      
      // PROJETISTAS
      { email: 'gustavo@visaobim.com', password: 'gustavo@2025', full_name: 'Gustavo Silva', role: 'user' },
      { email: 'bessa@visaobim.com', password: 'bessa@2025', full_name: 'Bessa Oliveira', role: 'user' },
      { email: 'leonardo@visaobim.com', password: 'leonardo@2025', full_name: 'Leonardo Costa', role: 'user' },
      { email: 'pedro@visaobim.com', password: 'pedro@2025', full_name: 'Pedro Almeida', role: 'user' },
      { email: 'thiago@visaobim.com', password: 'thiago@2025', full_name: 'Thiago Santos', role: 'user' },
      { email: 'nicolas@visaobim.com', password: 'nicolas@2025', full_name: 'Nicolas Ferreira', role: 'user' },
      { email: 'eloisy@visaobim.com', password: 'eloisy@2025', full_name: 'Eloisy Martins', role: 'user' },
      { email: 'rondinelly@visaobim.com', password: 'rondinelly@2025', full_name: 'Rondinelly Lima', role: 'user' },
      { email: 'edilson@visaobim.com', password: 'edilson@2025', full_name: 'Edilson Souza', role: 'user' },
      { email: 'philip@visaobim.com', password: 'philip@2025', full_name: 'Philip Rodrigues', role: 'user' },
      { email: 'nara@visaobim.com', password: 'nara@2025', full_name: 'Nara Carvalho', role: 'user' },
      { email: 'externo@visaobim.com', password: 'externo@2025', full_name: 'Projetista Externo', role: 'user' },
    ]

    const results = []

    for (const userData of users) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name
          }
        })

        if (authError) {
          console.error(`Error creating auth user ${userData.email}:`, authError)
          results.push({ 
            email: userData.email, 
            success: false, 
            error: authError.message 
          })
          continue
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            points: 0,
            level: 1
          })

        if (profileError) {
          console.error(`Error creating profile ${userData.email}:`, profileError)
          results.push({ 
            email: userData.email, 
            success: false, 
            error: profileError.message 
          })
        } else {
          results.push({ 
            email: userData.email, 
            success: true, 
            userId: authUser.user.id,
            role: userData.role
          })
        }

      } catch (error) {
        console.error(`Unexpected error for ${userData.email}:`, error)
        results.push({ 
          email: userData.email, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'User creation process completed',
        results: results,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to create users'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})