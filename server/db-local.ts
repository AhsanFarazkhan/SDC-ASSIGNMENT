import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import 'dotenv/config';
// Check for database URL in environment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/schoolfees';

console.log(`Connecting to database: ${databaseUrl.replace(/:[^:]+@/, ':****@')}`);

export const pool = new Pool({ 
  connectionString: databaseUrl,
  // Increase connection timeout
  connectionTimeoutMillis: 10000,
  // Disable SSL for local development
  ssl: false
});

// Export the drizzle instance
export const db = drizzle(pool, { schema });