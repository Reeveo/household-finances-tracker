import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { loggerConfig } from '../config/logger.config';

// Define log message interface
interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
  metadata: Record<string, unknown>;
}

// Define custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: loggerConfig.datePattern }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({
    fillExcept: ['timestamp', 'level', 'message']
  })
);

// Create file transport with rotation
const fileRotateTransport = new winston.transports.DailyRotateFile({
  dirname: loggerConfig.directory,
  filename: '%DATE%-app.log',
  datePattern: loggerConfig.datePattern,
  maxFiles: loggerConfig.maxFiles.app,
  maxSize: loggerConfig.maxSize,
  format: logFormat,
  level: loggerConfig.level,
  auditFile: path.join(loggerConfig.directory, 'audit.json'),
  zippedArchive: loggerConfig.zippedArchive,
});

// Create error-specific transport
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  dirname: loggerConfig.directory,
  filename: '%DATE%-error.log',
  datePattern: loggerConfig.datePattern,
  maxFiles: loggerConfig.maxFiles.error,
  maxSize: loggerConfig.maxSize,
  format: logFormat,
  level: 'error',
  auditFile: path.join(loggerConfig.directory, 'error-audit.json'),
  zippedArchive: loggerConfig.zippedArchive,
});

// Console transport with color
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(({ timestamp, level, message, metadata }: LogMessage) => {
      let msg = `${timestamp} [${level}]: ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
      }
      return msg;
    })
  ),
  level: process.env.NODE_ENV === 'development' ? 'debug' : loggerConfig.level,
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : loggerConfig.level,
  defaultMeta: { service: loggerConfig.service },
  transports: [
    consoleTransport,
    fileRotateTransport,
    errorFileRotateTransport,
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: loggerConfig.directory,
      filename: '%DATE%-exceptions.log',
      datePattern: loggerConfig.datePattern,
      maxFiles: loggerConfig.maxFiles.exceptions,
      format: logFormat,
      zippedArchive: loggerConfig.zippedArchive,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: loggerConfig.directory,
      filename: '%DATE%-rejections.log',
      datePattern: loggerConfig.datePattern,
      maxFiles: loggerConfig.maxFiles.exceptions,
      format: logFormat,
      zippedArchive: loggerConfig.zippedArchive,
    }),
  ],
  // Exit on error
  exitOnError: false,
});

// Export a function to create child loggers with context
export const createLogger = (context: string) => {
  return logger.child({ context });
};

// Export default logger
export default logger; 