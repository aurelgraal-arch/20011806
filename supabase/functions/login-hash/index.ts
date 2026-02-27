// @ts-ignore Deno runtime type definitions
/// <reference lib="deno.ns" />
// @ts-ignore Deno standard library
import { serve } from "std/http/server"

// Edge function implementing hash-based authentication.
// It reads `issued_sequences/issued_hash.txt` in the repo, which maps hashes to
// user emails.  When a valid hash is presented it attempts to authenticate
// the associated Supabase user by using the hash as their password.
// To deploy:
//   supabase functions deploy login-hash
// Ensure you have SERVICE_ROLE_KEY in your environment for the function.

async function loadMap(): Promise<Map<string, string>> {
  // @ts-ignore Deno API
  const raw = await Deno.readTextFile('./issued_sequences/issued_hash.txt')
  const map = new Map<string, string>()
  raw.split('\n').forEach((line: string) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [hash, email] = trimmed.split(',')
    if (hash && email) {
      map.set(hash, email)
    }
  })
  return map
}

serve(async (req: Request) => {
  try {
    const { hash } = await req.json()
    if (!hash) {
      return new Response(JSON.stringify({ error: 'Hash required' }), { status: 400 })
    }

    const map = await loadMap()
    const email = map.get(hash)
    if (!email) {
      return new Response(JSON.stringify({ error: 'Invalid hash' }), { status: 401 })
    }

    // @ts-ignore Deno API
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-ignore Deno API
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // attempt to sign in using the hash as password
    const resp = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      },
      body: JSON.stringify({ email, password: hash }),
    })
    const data = await resp.json()
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error_description || data.error }), { status: 401 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 })
  }
})
