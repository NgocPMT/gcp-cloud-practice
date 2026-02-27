// persistence/postgres.js
const waitPort = require('wait-port');
const fs = require('fs');
const { Pool } = require('pg');

// Define the Structured Logger for GCP
const logger = {
    info: (message, meta = {}) =>
        console.log(JSON.stringify({ severity: 'INFO', message, ...meta })),
    error: (message, meta = {}) =>
        console.error(JSON.stringify({ severity: 'ERROR', message, ...meta })),
};

const {
    POSTGRES_HOST: HOST,
    POSTGRES_HOST_FILE: HOST_FILE,
    POSTGRES_USER: USER,
    POSTGRES_USER_FILE: USER_FILE,
    POSTGRES_PASSWORD: PASSWORD,
    POSTGRES_PASSWORD_FILE: PASSWORD_FILE,
    POSTGRES_DB: DB,
    POSTGRES_DB_FILE: DB_FILE,
} = process.env;

let pool;

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

    logger.info(`Attempting to connect to PostgreSQL database`, {
        host,
        port: 5432,
        database,
    });

    try {
        await waitPort({
            host,
            port: 5432, // Changed from 3306
            timeout: 10000,
            waitForDns: true,
        });
    } catch (err) {
        logger.error(
            `Failed to reach PostgreSQL port. The DB container might be unreachable.`,
            { error: err.message, host },
        );
        throw err;
    }

    pool = new Pool({
        max: 5, // Equivalent to connectionLimit
        host,
        user,
        password,
        database,
        port: 5432,
    });

    try {
        // Postgres uses standard boolean types, no need for charset declarations
        await pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
        );
        logger.info(`Successfully connected and initialized PostgreSQL db`, {
            host: HOST,
        });
    } catch (err) {
        logger.error(`Failed to initialize todo_items table`, {
            error: err.message,
            code: err.code,
        });
        throw err;
    }
}

async function teardown() {
    logger.info(`Tearing down PostgreSQL connection pool`);
    try {
        await pool.end();
    } catch (err) {
        logger.error(`Error closing PostgreSQL pool`, { error: err.message });
        throw err;
    }
}

async function getItems() {
    try {
        const result = await pool.query('SELECT * FROM todo_items');
        return result.rows; // No boolean mapping needed!
    } catch (err) {
        logger.error(`Failed to fetch items`, { error: err.message });
        throw err;
    }
}

async function getItem(id) {
    try {
        // Postgres uses $1, $2 instead of ?
        const result = await pool.query(
            'SELECT * FROM todo_items WHERE id=$1',
            [id],
        );
        return result.rows[0];
    } catch (err) {
        logger.error(`Failed to fetch item`, {
            itemId: id,
            error: err.message,
        });
        throw err;
    }
}

async function storeItem(item) {
    try {
        await pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES ($1, $2, $3)',
            [item.id, item.name, item.completed],
        );
        logger.info(`Stored new todo item`, { itemId: item.id });
    } catch (err) {
        logger.error(`Failed to store item`, {
            itemId: item.id,
            error: err.message,
        });
        throw err;
    }
}

async function updateItem(id, item) {
    try {
        await pool.query(
            'UPDATE todo_items SET name=$1, completed=$2 WHERE id=$3',
            [item.name, item.completed, id],
        );
        logger.info(`Updated todo item`, { itemId: id });
    } catch (err) {
        logger.error(`Failed to update item`, {
            itemId: id,
            error: err.message,
        });
        throw err;
    }
}

async function removeItem(id) {
    try {
        await pool.query('DELETE FROM todo_items WHERE id = $1', [id]);
        logger.info(`Deleted todo item`, { itemId: id });
    } catch (err) {
        logger.error(`Failed to delete item`, {
            itemId: id,
            error: err.message,
        });
        throw err;
    }
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
