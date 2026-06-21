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
  const userId = 'a9544139-dbf1-4749-9fda-141a818e5bae'; // Ajeet1902
  console.log('Testing insert on typing_sessions...');
  const { data, error } = await supabase
    .from('typing_sessions')
    .insert([{
      user_id: userId,
      wpm: 34,
      accuracy: 98.00,
      level_type: 'intermediate',
      duration: 30,
      errors: 1,
      chars_typed: 150
    }])
    .select();
  console.log('Insert result:', data, 'Error:', error);
})();
