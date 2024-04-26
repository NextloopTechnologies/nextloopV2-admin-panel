import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from '../../migrations/schema';
import { migrate } from "drizzle-orm/postgres-js/migrator";
import config from "@/config";

if(!config.databaseUrl) {
  console.log("🔴 Cannot find database url")
}

const connectionString = config.databaseUrl;

const client = postgres(connectionString as string);

const db = drizzle(client, { schema });

const migrateDb = async () => {
  try {
    console.log("🟡 MIGRATING CLIENT...");
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log("🟢 SUCCESSFULLY MIGRATED!")
  } catch (error) {
    console.log("🔴 ERROR MIGRATING!!!", error)
  }
}
migrateDb();

export default db;