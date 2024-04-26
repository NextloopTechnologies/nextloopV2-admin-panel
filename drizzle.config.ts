import type { Config } from 'drizzle-kit';
import config from './config';

if(!config.databaseUrl) {
  console.log("🔴 CANNOT FIND DB URL!")
}

export default {
  schema: './lib/supabase/schema.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: config.databaseUrl || ''
  }
} satisfies Config
