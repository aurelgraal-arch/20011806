import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts'

// Edge function to authenticate via Supabase Auth and return session
// This code runs on Supabase Edge Functions (Deno runtime).
// Deploy with: supabase functions deploy login

serve(async (req) => {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error_description || data.error }), { status: 401 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
