const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// load env from .env.local if present
let env = {}
try {
  const raw = fs.readFileSync('.env.local', 'utf8')
  raw.split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/i)
    if (m) env[m[1]] = m[2].trim()
  })
} catch (e) {}

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing Supabase credentials in .env.local or env')
  process.exit(2)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  // generate ids
  const userId = crypto.randomUUID()
  const sequence = crypto.randomBytes(32).toString('hex')
  const publicName = `testuser_${sequence.slice(0,6)}`

  console.log('Creating test profile with id:', userId)
  let profileData, pErr
  // attempt full insert; if schema differs try minimal
  ({ data: profileData, error: pErr } = await supabase
    .from('profiles')
    .insert([{ id: userId, public_name: publicName, bio: 'Test profile', theme: '', level: 1, coins: 100 }])
    .select())
  if (pErr && pErr.code === '42703') {
    // column not found, retry minimal
    console.warn('Profile insert error, retrying minimal:', pErr.message)
    ({ data: profileData, error: pErr } = await supabase
      .from('profiles')
      .insert([{ id: userId, public_name: publicName }])
      .select())
  }

  if (pErr) {
    console.error('Profile insert error:', pErr.message)
    process.exit(3)
  }

  console.log('Profile created:', profileData && profileData[0] ? profileData[0].id : null)

  console.log('Inserting sequence:', sequence)
  const { data: seqData, error: sErr } = await supabase
    .from('issued_sequences')
    .insert([{ user_id: userId, sequence_hash: sequence }])
    .select()

  if (sErr) {
    console.error('Issued sequence insert error:', sErr.message)
    process.exit(4)
  }

  console.log('Issued sequence created for user:', userId)
  console.log('\nSEQUENCE:', sequence)
  process.exit(0)
}

run().catch((e) => {
  console.error('Unexpected error', e)
  process.exit(99)
})
