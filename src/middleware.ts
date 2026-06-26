import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize server-side Supabase client if configured
const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'your_supabase_url';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware checks for admin pages and admin APIs
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next();
  }

  const localRoleCookie = request.cookies.get('local-user-role')?.value;
  const token = request.cookies.get('sb-access-token')?.value;

  // 1. Local/Mock Session Bypass (Allows seamless dev navigation when client uses mock mode)
  if (localRoleCookie === 'admin' && (!token || token === 'local-mock-token')) {
    return NextResponse.next();
  }

  // 2. Local Mode Bypass
  if (!isSupabaseConfigured) {
    if (localRoleCookie === 'admin') {
      return NextResponse.next();
    }
    
    // Redirect or block API
    if (isAdminApi) {
      return new NextResponse(
        JSON.stringify({ error: 'Access Denied: You do not have permission to access this page.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
  }

  // 3. Production Supabase Mode
  if (!token) {
    if (isAdminApi) {
      return new NextResponse(
        JSON.stringify({ error: 'Access Denied: You do not have permission to access this page.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify user session using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid session token');
    }

    const isHardcodedAdmin = user.email && user.email.toLowerCase() === 'kumarajeet19022004@gmail.com';

    // Fetch user profile to verify role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Use profile role if available, otherwise default to admin if the email matches
    const role = profile?.role || (isHardcodedAdmin ? 'admin' : 'user');

    if (role !== 'admin') {
      throw new Error('Unauthorized role');
    }

    // Allowed: User is verified and has admin role
    return NextResponse.next();
  } catch (err) {
    if (isAdminApi) {
      return new NextResponse(
        JSON.stringify({ error: 'Access Denied: You do not have permission to access this page.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
