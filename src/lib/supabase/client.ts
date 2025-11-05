'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

let client: ReturnType<typeof createClient<Database>> | null = null;

// Browser client for use in Client Components (singleton pattern)
export const createBrowserClient = () => {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
};