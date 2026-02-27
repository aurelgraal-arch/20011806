const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
let env = {}
try { const raw = fs.readFileSync('.env.local','utf8'); raw.split('\n').forEach(line=>{ const m=line.match(/^\s*([A-Z0-9_]+)=(.*)$/i); if(m) env[m[1]] = m[2].trim() }) } catch(e){}
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
if(!SUPABASE_URL||!SUPABASE_ANON){ console.error('Missing credentials'); process.exit(2)}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
async function run(){
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if(error){ console.error('Error fetching profiles:', error.message); process.exit(3)}
  if(!data || data.length===0){ console.log('No profiles found') ; process.exit(0)}
  console.log('Profile sample keys:', Object.keys(data[0]))
  console.log('Sample row:', data[0])
}
run().catch(e=>{console.error(e); process.exit(99)})
