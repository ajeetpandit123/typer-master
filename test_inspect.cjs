const fs = require('fs');
const path = require('path');

// Read .env.local
const dotenvContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenvContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  try {
    // 1. Fetch profiles
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*');
    console.log('--- PROFILES ---');
    console.log(profiles, pErr);

    // 2. Fetch sessions
    const { data: sessions, error: sErr } = await supabase
      .from('typing_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    console.log('--- SESSIONS ---');
    console.log(sessions ? sessions.slice(0, 10) : null, sErr);

    // 3. Max WPM from sessions
    if (sessions && sessions.length > 0) {
      console.log('Max WPM from sessions:', Math.max(...sessions.map(s => s.wpm)));
    }
  } catch (err) {
    console.error(err);
  }
})();
