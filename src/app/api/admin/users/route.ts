import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/services/apiAuth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'your_supabase_url';

export async function GET(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin(request);
  
  if (!isAdmin) {
    return NextResponse.json({ error: error || 'Forbidden' }, { status: 403 });
  }

  // 1. Local Mock Users Response
  if (!isSupabaseConfigured) {
    const mockUsers = [
      { id: '1', username: 'ajeet', email: 'ajeet@example.com', role: 'user', created_at: '2026-06-23T10:15:43Z', level: 1, xp: 195, wpm: 31, accuracy: 99.67, practice_time: 172, total_tests: 4 },
      { id: '2', username: 'Ajeet1902', email: 'kumarajeet19022004@gmail.com', role: 'admin', created_at: '2026-06-20T11:40:07Z', level: 4, xp: 911, wpm: 71, accuracy: 89.83, practice_time: 2383, total_tests: 18 },
      { id: '3', username: 'Riya09', email: 'riya09@example.com', role: 'user', created_at: '2026-06-23T10:14:17Z', level: 1, xp: 0, wpm: 0, accuracy: 0, practice_time: 0, total_tests: 0 },
      { id: '4', username: 'dhanji', email: 'dhanji@example.com', role: 'user', created_at: '2026-06-24T10:09:13Z', level: 1, xp: 0, wpm: 0, accuracy: 0, practice_time: 0, total_tests: 0 }
    ];
    return NextResponse.json({ users: mockUsers });
  }

  // 2. Production Supabase Query
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    // Fetch all profiles
    const { data: profiles, error: dbErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbErr) throw dbErr;

    // Fetch typing session counts to report total tests completed by each user
    const { data: sessions } = await supabase
      .from('typing_sessions')
      .select('user_id');

    const sessionCounts: Record<string, number> = {};
    sessions?.forEach((s) => {
      sessionCounts[s.user_id] = (sessionCounts[s.user_id] || 0) + 1;
    });

    const users = profiles.map((p) => ({
      id: p.id,
      username: p.username || 'Anonymous',
      email: p.email || `${(p.username || 'anonymous').toLowerCase()}@example.com`,
      role: p.role || 'user',
      created_at: p.created_at,
      level: p.level,
      xp: p.xp,
      wpm: p.wpm,
      accuracy: Number(p.accuracy),
      practice_time: p.practice_time,
      total_tests: sessionCounts[p.id] || 0
    }));

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
