import { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AuthResult {
  user: any | null;
  session: any | null;
  error: string | null;
  supabase: any;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Can't set cookies in middleware
        },
        remove(name: string, options: CookieOptions) {
          // Can't remove cookies in middleware
        },
      },
    }
  );

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return {
      user: null,
      session: null,
      error: 'Unauthorized - Please log in',
      supabase,
    };
  }

  return {
    user: session.user,
    session,
    error: null,
    supabase,
  };
}