import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Database } from '@/types';

let browserClient: any = null;

export const createBrowserClient = () => {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  
  return browserClient;
};