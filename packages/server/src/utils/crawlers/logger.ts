const levels = ['info', 'warn', 'error', 'debug'];


function log(level: string, message: string): void {
    if (!levels.includes(level)) {
        throw new Error(`Invalid log level: ${level}`);
    }
    const timestamp = new Date().toISOString(); 
    console.log(`${timestamp} [${level.toUpperCase()}]: ${message}`);
}

interface Logger {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
}

const logger: Logger = {
    info: (message: string) => log('info', message),
    warn: (message: string) => log('warn', message),
    error: (message: string) => log('error', message),
    debug: (message: string) => log('debug', message),
};

export { logger };
