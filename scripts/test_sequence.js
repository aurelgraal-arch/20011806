const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const SEQ = process.argv[2]
if (!SEQ) {
  console.error('Usage: node scripts/test_sequence.js <sequence_id>')
  process.exit(2)
}

// load .env.local if present
let env = {}
try {
  const raw = fs.readFileSync('.env.local', 'utf8')
  raw.split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/i)
    if (m) env[m[1]] = m[2].trim()
  })
} catch (e) {
  // ignore
}

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing Supabase credentials in .env.local or env')
  process.exit(3)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Checking sequence:', SEQ)
  const { data, error } = await supabase
    .from('issued_sequences')
    .select('*')
    .eq('sequence_hash', SEQ)
    .limit(1)

  if (error) {
    console.error('Query error:', error.message)
    process.exit(4)
  }

  if (!data || data.length === 0) {
    console.log('Sequence NOT found')
    process.exit(0)
  }

  const seq = data[0]
  console.log('Sequence record:', seq)

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', seq.user_id)
    .limit(1)

  if (pErr) {
    console.error('Profile query error:', pErr.message)
    process.exit(5)
  }

  console.log('Profile:', profile && profile.length ? profile[0] : null)
}

run().catch((e) => {
  console.error('Unexpected error', e)
  process.exit(99)
})
