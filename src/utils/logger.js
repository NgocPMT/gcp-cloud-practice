const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

// 1. Start with just the local terminal console transport
const transports = [new winston.transports.Console()];

// 2. ONLY attach the Google Cloud transport if we are actually in production!
if (process.env.NODE_ENV === 'production') {
    const loggingWinston = new LoggingWinston({
        logName: 'todo-app-logs',
    });
    transports.push(loggingWinston);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: transports, // Inject the conditional transports here
});

module.exports = { logger };
