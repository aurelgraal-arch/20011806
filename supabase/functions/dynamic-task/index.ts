// @ts-ignore Deno runtime type definitions
/// <reference lib="deno.ns" />
// @ts-ignore Deno standard library
import { serve } from "std/http/server"
// @ts-ignore Deno standard library
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * Dynamic Task Edge Function
 * Validates login sequences against the issued_sequences database table
 * Uses Supabase service role key for direct database access
 * 
 * Deploy with: supabase functions deploy dynamic-task
 */

serve(async (req: Request) => {
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
// for login via email we expect body.email, for other actions we expect body.user_id
    const sequence_id: string | undefined = body.sequence_id || body.sequence
    const user_id: string | undefined = body.user_id
    const email: string | undefined = body.email

    if (body.action === 'login') {
      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email required for login' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      // no sequence check
      console.log('[EdgeFn] Login request for email:', email)
    } else {
      // non-login: require user_id or fallback to sequence lookup
      if (!user_id && !sequence_id) {
        return new Response(
          JSON.stringify({ error: 'User ID or sequence required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('[EdgeFn] Action:', body.action)

    // @ts-ignore Deno API
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore Deno API
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[EdgeFn] Missing Supabase configuration')
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Query the issued_sequences table
    console.log('[EdgeFn] Querying issued_sequences for sequence_hash:', sequence_id)
    
    const { data, error } = await supabase
      .from('issued_sequences')
      .select('*')
      .eq('sequence_hash', sequence_id)
      .single()

    if (error) {
      console.error('[EdgeFn] Database query error:', error.code, error.message)
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!data) {
      console.log('[EdgeFn] No data returned')
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('[EdgeFn] Sequence found, user_id:', data.user_id)

    // fetch profile information for the user
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, public_name, level, coins')
        .eq('id', data.user_id)
        .single()

    let userObj: any = {
      id: data.user_id,
      sequence_id,
      public_name: '',
      level: 1,
    }

    if (profErr) {
      console.error('[EdgeFn] Profile fetch error:', profErr.message)
    } else if (profile) {
      userObj = {
        id: profile.id,
        sequence_id,
        public_name: profile.public_name || '',
        level: profile.level || 1,
      }
    }

    // if action is login, return the user object
      const action = (body.action || 'login').toString()
      switch (action) {
        case 'login':
          // return validated user
          return new Response(
            JSON.stringify({ valid: true, user: userObj }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )

        case 'dashboard_data': {
          // minimal dashboard response
          const stats = {
            level: userObj.level,
            balance: userObj.wallet_balance || 0,
            badge_count: 0,
          }
          return new Response(JSON.stringify({ success: true, data: stats }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        case 'get_profile': {
          return new Response(JSON.stringify({ success: true, data: profile || {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        case 'update_profile': {
          const payload = body
          const updates: any = {}
          if (payload.name) updates.public_name = payload.name
          if (payload.bio) updates.bio = payload.bio
          if (payload.avatar_url) updates.avatar_url = payload.avatar_url
          if (payload.theme_choice) updates.theme = payload.theme_choice

          const { data: up, error: upErr } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', data.user_id)
            .select()
          if (upErr) {
            return new Response(JSON.stringify({ success: false, error: upErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          }
          return new Response(JSON.stringify({ success: true, data: up }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

        case 'create_forum_post': {
          const payload = body
          const insert = {
            user_id: data.user_id,
            title: payload.title || '',
            problem: payload.problem || '',
            solution: payload.solution || '',
            description: payload.description || '',
            media_url: payload.media_url || '',
            media_type: payload.media_type || '',
            created_at: new Date().toISOString(),
          }
          const { data: inserted, error: insErr } = await supabase.from('forum_posts').insert([insert]).select()
          if (insErr) return new Response(JSON.stringify({ success: false, error: insErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          return new Response(JSON.stringify({ success: true, data: inserted }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

        case 'get_forum_posts': {
          const { data: posts, error: postsErr } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false })
          if (postsErr) return new Response(JSON.stringify({ success: false, error: postsErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          return new Response(JSON.stringify({ success: true, data: posts }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

        case 'create_journey_step': {
          const payload = body
          const insert = {
            user_id: data.user_id,
            title: payload.title || '',
            reflection: payload.reflection || '',
            description: payload.description || '',
            media_url: payload.media_url || '',
            media_type: payload.media_type || '',
            created_at: new Date().toISOString(),
          }
          const { data: inserted, error: insErr } = await supabase.from('journey_steps').insert([insert]).select()
          if (insErr) return new Response(JSON.stringify({ success: false, error: insErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          return new Response(JSON.stringify({ success: true, data: inserted }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

        case 'get_journey_steps': {
          const { data: steps, error: stepsErr } = await supabase.from('journey_steps').select('*').order('created_at', { ascending: false })
          if (stepsErr) return new Response(JSON.stringify({ success: false, error: stepsErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
          return new Response(JSON.stringify({ success: true, data: steps }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

        default:
          return new Response(JSON.stringify({ success: false, error: 'Unknown action' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }
    if (body.action === 'login') {
      return new Response(
        JSON.stringify({ valid: true, user: userObj }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // for any other action, echo success (future implementations)
    console.log('[EdgeFn] processing action:', body.action)
    return new Response(
      JSON.stringify({ valid: true, user: userObj }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[EdgeFn] Error:', errorMessage)
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
