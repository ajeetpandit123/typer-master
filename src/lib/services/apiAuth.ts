import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'your_supabase_url';

export async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; error?: string; userId?: string }> {
  if (!isSupabaseConfigured) {
    const localRole = request.cookies.get('local-user-role')?.value;
    if (localRole === 'admin') {
      return { isAdmin: true, userId: 'local-mock-admin-id' };
    }
    return { isAdmin: false, error: 'Access Denied: You do not have permission to access this page.' };
  }

  const token = request.cookies.get('sb-access-token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // Local/Mock Session Bypass
  if (token === 'local-mock-token') {
    const localRole = request.cookies.get('local-user-role')?.value;
    if (localRole === 'admin') {
      return { isAdmin: true, userId: 'local-mock-admin-id' };
    }
  }

  if (!token) {
    return { isAdmin: false, error: 'Access Denied: Missing session token.' };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return { isAdmin: false, error: 'Access Denied: Invalid user session.' };
    }

    const isHardcodedAdmin = user.email && user.email.toLowerCase() === 'kumarajeet19022004@gmail.com';

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Use profile role if available, otherwise default to admin if the email matches
    const role = profile?.role || (isHardcodedAdmin ? 'admin' : 'user');

    if (role !== 'admin') {
      return { isAdmin: false, error: 'Access Denied: Admin role required.' };
    }

    return { isAdmin: true, userId: user.id };
  } catch (err) {
    return { isAdmin: false, error: 'Access Denied: Session verification failed.' };
  }
}
