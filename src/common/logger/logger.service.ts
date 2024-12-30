import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class AppLoggerService implements LoggerService {
    private readonly winstonLogger;
    private readonly consoleLogger = new Logger('LoggerService'); // NestJS Logger

    constructor() {
        // Ensure the logs directory exists
        if (!existsSync('logs')) {
            mkdirSync('logs');
        }

        // Configure Winston logger to log only to files
        this.winstonLogger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
            ),
            transports: [
                new transports.File({ filename: 'logs/app.log', level: 'info' }), // Log general messages to file
                new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log error messages to file
            ],
        });
    }

    log(message: string) {
        this.consoleLogger.log(message); // Output to console
        this.winstonLogger.info(message); // Write to file
    }

    error(message: string, trace?: string) {
        this.consoleLogger.error(message, trace); // Output to console
        this.winstonLogger.error(`${message} - Trace: ${trace}`); // Write to file
    }

    warn(message: string) {
        this.consoleLogger.warn(message); // Output to console
        this.winstonLogger.warn(message); // Write to file
    }

    debug(message: string) {
        this.consoleLogger.debug(message); // Output to console
        this.winstonLogger.debug(message); // Write to file
    }

    verbose(message: string) {
        this.consoleLogger.verbose(message); // Output to console
        this.winstonLogger.verbose(message); // Write to file
    }

    // Example: Additional custom logging for external systems
    logToExternalSystem(level: string, message: string) {
        console.log(`[EXTERNAL] ${level.toUpperCase()}: ${message}`);
        this.winstonLogger.log(level, message); // Write to file if needed
    }
}
