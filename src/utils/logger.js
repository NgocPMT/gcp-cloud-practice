const { Logging } = require('@google-cloud/logging');

// Initialize the GCP Logging client.
const logging = new Logging();
const log = logging.log('todo-app-logs');

const logger = {
    info: (message, meta = {}) => {
        const metadata = { severity: 'INFO' };
        // The payload is an object containing your message and any extra data
        const entry = log.entry(metadata, { message, ...meta });
        log.write(entry);

        // Keep a local console.log just in case we need to view logs via SSH
        console.log(`[INFO] ${message}`, meta);
    },
    error: (message, meta = {}) => {
        const metadata = { severity: 'ERROR' };
        const entry = log.entry(metadata, { message, ...meta });
        log.write(entry);

        console.error(`[ERROR] ${message}`, meta);
    },
};

module.exports = { logger };
