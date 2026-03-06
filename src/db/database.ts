import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { secret } from 'encore.dev/config';

let dbUrl = process.env.DATABASE_URL;
let dbUrlSecret = secret('DATABASE_URL'); // Fallback for Encore Cloud deployment

const pool = new Pool({
    connectionString: dbUrl || dbUrlSecret(),
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
