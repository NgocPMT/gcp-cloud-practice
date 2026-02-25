const formatLog = (severity, message, meta = {}) => {
    return JSON.stringify({
        severity,
        message,
        ...meta,
    });
};

export const logger = {
    info: (message, meta) => console.log(formatLog('INFO', message, meta)),
    warn: (message, meta) => console.warn(formatLog('WARNING', message, meta)),
    error: (message, meta) => console.error(formatLog('ERROR', message, meta)),
};
