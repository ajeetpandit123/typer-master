const fs = require('fs');
const path = require('path');

// Read .env.local
const dotenvContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  console.log('Profiles in Supabase:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
})();
