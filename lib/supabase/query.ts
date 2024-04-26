import { createClient } from '@supabase/supabase-js'
import config from "@/config";
import { Database } from "@/types/supabase/supabase";

const supabase = createClient<Database>(
  config.supabaseUrl as string, 
  config.supabaseAnonKey as string
)

export const readAllPortfolio = async() => {
  const { data, status, error } = await supabase
  .from("portfolio")
  .select()

  if(data) return { data, status }
  throw error
}