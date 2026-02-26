const express = require('express');
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');
const { logger } = require('./utils/logger');

const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(__dirname + '/static'));

// This logs every single incoming request and how long it took to respond
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: duration,
        };

        // If the request fails (4xx or 5xx), log it as an error, otherwise it's an info log
        if (res.statusCode >= 400) {
            logger.error(
                `HTTP Request Failed: ${req.method} ${req.originalUrl}`,
                logData,
            );
        } else {
            logger.info(
                `HTTP Request Success: ${req.method} ${req.originalUrl}`,
                logData,
            );
        }
    });
    next();
});

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// Catch Server Startup Errors
db.init()
    .then(() => {
        app.listen(PORT, HOST, () =>
            logger.info(`Server running`, { host: HOST, port: PORT }),
        );
    })
    .catch((err) => {
        logger.error(
            `Fatal error during database initialization. Shutting down.`,
            { error: err.message, stack: err.stack },
        );

        logger.on('finish', () => {
            process.exit(1);
        });

        logger.end();
    });

// Trace the Graceful Shutdown Sequence
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    db.teardown()
        .catch((err) => {
            logger.error(`Error during database teardown`, {
                error: err.message,
            });
        })
        .then(() => {
            logger.info(`Graceful shutdown complete. Exiting process.`);
            process.exit(0);
        });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Sent by nodemon
