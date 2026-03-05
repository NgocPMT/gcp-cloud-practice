import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { existsSync, readFileSync } from 'fs';

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && process.env.DATABASE_URL_FILE) {
    const path = process.env.DATABASE_URL_FILE;
    if (existsSync(path)) {
        dbUrl = readFileSync(path, 'utf8').trim();
    }
}

if (!dbUrl) {
    throw new Error('DATABASE_URL not configured');
}

const pool = new Pool({
    connectionString: dbUrl,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
