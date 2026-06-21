const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  try {
    console.log('\n--- 1. Testing Profiles Table ---');
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (pError) {
      console.error('Error reading profiles table:', pError);
    } else {
      console.log('Successfully read profiles. Count:', profiles.length);
      console.log('Profiles data:', JSON.stringify(profiles, null, 2));
    }

    console.log('\n--- 2. Testing Typing Sessions Table ---');
    const { data: sessions, error: sError } = await supabase
      .from('typing_sessions')
      .select('*')
      .limit(5);

    if (sError) {
      console.error('Error reading typing_sessions table:', sError);
    } else {
      console.log('Successfully read typing_sessions. Count:', sessions.length);
      console.log('Sessions data:', JSON.stringify(sessions, null, 2));
    }

    console.log('\n--- 3. Testing Challenge Progress Table ---');
    const { data: challengeProgress, error: cError } = await supabase
      .from('challenge_progress')
      .select('*')
      .limit(5);

    if (cError) {
      console.error('Error reading challenge_progress table:', cError);
    } else {
      console.log('Successfully read challenge_progress. Count:', challengeProgress.length);
    }

  } catch (err) {
    console.error('Unexpected error running database test:', err);
  }
}

runTests();
