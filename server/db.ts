import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { logger } from '@logger';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Add connection health check
export async function checkDatabaseHealth() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    logger.error('Database health check failed', { error: err });
    return false;
  }
}

// Add connection event listeners
pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err });
});

pool.on('connect', () => {
  logger.debug('Database connection established');
});

pool.on('remove', () => {
  logger.debug('Database connection closed');
});