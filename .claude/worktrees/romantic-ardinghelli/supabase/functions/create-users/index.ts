import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fbdd3d5b-9423-4ee8-90f1-fe976e495955.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar token de administrador
    const adminToken = req.headers.get('x-admin-token')
    const expectedToken = Deno.env.get('ADMIN_TOKEN') || 'secure-admin-token-2024'
    
    if (!adminToken || adminToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin token required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Lista básica de usuários para desenvolvimento (senhas devem ser alteradas no primeiro login)
    const users = [
      {
        email: 'admin@visaobim.com',
        password: 'TempPassword2024!', 
        full_name: 'Administrador Sistema',
        role: 'admin'
      }
    ]

    const results = []
    
    for (const userData of users) {
      try {
        // Verificar se usuário já existe (usando listUsers com filtro)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const userExists = existingUsers?.users?.some(u => u.email === userData.email)
        
        if (userExists) {
          console.log(`User ${userData.email} already exists, skipping...`)
          results.push({
            email: userData.email,
            success: false,
            message: 'User already exists'
          })
          continue
        }

        // Criar usuário de autenticação
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        })

        if (authError) {
          console.error(`Error creating user ${userData.email}:`, authError)
          results.push({
            email: userData.email,
            success: false,
            error: authError.message
          })
          continue
        }

        // Criar profile do usuário
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            points: 0,
            level: 1
          })

        if (profileError) {
          console.error(`Error creating profile for ${userData.email}:`, profileError)
          results.push({
            email: userData.email,
            success: false,
            error: profileError.message
          })
        } else {
          console.log(`✅ Successfully created user ${userData.email}`)
          results.push({
            email: userData.email,
            success: true,
            message: 'User and profile created successfully'
          })
        }
      } catch (err: unknown) {
        console.error(`Error processing user ${userData.email}:`, err)
        results.push({
          email: userData.email,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error occurred'
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'User creation process completed',
        results: results,
        total: users.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})