import * as dotenv from 'dotenv';
dotenv.config();

export default {
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_ENDPOINT,
  imageKitPublicKey: process.env.NEXT_PUBLIC_IK_PUBLIC_KEY,
  imageKitPrivateKey: process.env.NEXT_PUBLIC_IK_PRIVATE_KEY,
  imageKitCloudUrl: process.env.NEXT_PUBLIC_IK_URL_ENDPOINT,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}