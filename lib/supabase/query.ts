import { createClient } from '@supabase/supabase-js'
import config from "@/config";
import { Database } from "@/types/supabase";

const supabaseUrl = config.supabaseUrl;
const supabaseKey = config.supabaseServiceRoleKey || config.supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 0,
      }
    }    
  }
)
