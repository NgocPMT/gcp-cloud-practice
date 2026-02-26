const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston({
    logName: 'todo-app-logs',
});

const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console(), loggingWinston],
});

module.exports = { logger };
