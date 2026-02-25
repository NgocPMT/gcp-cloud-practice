const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');

// Define the Structured Logger for GCP
const logger = {
    info: (message, meta = {}) =>
        console.log(JSON.stringify({ severity: 'INFO', message, ...meta })),
    error: (message, meta = {}) =>
        console.error(JSON.stringify({ severity: 'ERROR', message, ...meta })),
};

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let pool;

async function init() {
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

    logger.info(`Attempting to connect to MySQL database`, {
        host,
        port: 3306,
        database,
    });

    // Wrap waitPort in a try/catch to log timeout errors before crashing
    try {
        await waitPort({
            host,
            port: 3306,
            timeout: 10000,
            waitForDns: true,
        });
    } catch (err) {
        logger.error(
            `Failed to reach MySQL port. The Vault might be unreachable.`,
            { error: err.message, host },
        );
        throw err;
    }

    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
    });

    return new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4',
            (err) => {
                if (err) {
                    logger.error(`Failed to initialize todo_items table`, {
                        error: err.message,
                        code: err.code,
                    });
                    return rej(err);
                }

                logger.info(`Successfully connected and initialized MySQL db`, {
                    host: HOST,
                });
                acc();
            },
        );
    });
}

async function teardown() {
    logger.info(`Tearing down MySQL connection pool`);
    return new Promise((acc, rej) => {
        pool.end((err) => {
            if (err) {
                logger.error(`Error closing MySQL pool`, {
                    error: err.message,
                });
                rej(err);
            } else {
                acc();
            }
        });
    });
}

async function getItems() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items', (err, rows) => {
            if (err) {
                logger.error(`Failed to fetch items`, { error: err.message });
                return rej(err);
            }
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) {
                logger.error(`Failed to fetch item`, {
                    itemId: id,
                    error: err.message,
                });
                return rej(err);
            }
            acc(
                rows.map((item) =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item) {
    return new Promise((acc, rej) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            (err) => {
                if (err) {
                    logger.error(`Failed to store item`, {
                        itemId: item.id,
                        error: err.message,
                    });
                    return rej(err);
                }
                logger.info(`Stored new todo item`, { itemId: item.id });
                acc();
            },
        );
    });
}

async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        pool.query(
            'UPDATE todo_items SET name=?, completed=? WHERE id=?',
            [item.name, item.completed ? 1 : 0, id],
            (err) => {
                if (err) {
                    logger.error(`Failed to update item`, {
                        itemId: id,
                        error: err.message,
                    });
                    return rej(err);
                }
                logger.info(`Updated todo item`, { itemId: id });
                acc();
            },
        );
    });
}

async function removeItem(id) {
    return new Promise((acc, rej) => {
        pool.query('DELETE FROM todo_items WHERE id = ?', [id], (err) => {
            if (err) {
                logger.error(`Failed to delete item`, {
                    itemId: id,
                    error: err.message,
                });
                return rej(err);
            }
            logger.info(`Deleted todo item`, { itemId: id });
            acc();
        });
    });
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
