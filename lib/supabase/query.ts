import { createClient } from '@supabase/supabase-js'
import config from "@/config";
import { Database } from "@/types/supabase/supabase";

export const supabase = createClient<Database>(
  config.supabaseUrl as string, 
  config.supabaseAnonKey as string
)
