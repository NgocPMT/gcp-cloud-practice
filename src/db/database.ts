import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { secret } from 'encore.dev/config';

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    try {
        dbUrl = secret('DATABASE_URL')();
    } catch (err) {
        throw new Error('Database URL is not configured');
    }
}

const pool = new Pool({
    connectionString: dbUrl,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
