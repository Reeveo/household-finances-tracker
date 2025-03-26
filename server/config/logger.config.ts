import { config } from 'dotenv';

// Load environment variables
config();

export interface LoggerConfig {
  directory: string;
  level: string;
  maxSize: string;
  maxFiles: {
    app: string;
    error: string;
    exceptions: string;
  };
  datePattern: string;
  zippedArchive: boolean;
  service: string;
}

// Default values for the logger configuration
const defaultConfig: LoggerConfig = {
  directory: 'logs',
  level: 'info',
  maxSize: '20m',
  maxFiles: {
    app: '14d',
    error: '30d',
    exceptions: '30d',
  },
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  service: 'personal-finance-tracker'
};

// Environment-specific configuration
export const loggerConfig: LoggerConfig = {
  directory: process.env.LOG_DIR || defaultConfig.directory,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : defaultConfig.level),
  maxSize: process.env.LOG_MAX_SIZE || defaultConfig.maxSize,
  maxFiles: {
    app: process.env.LOG_MAX_FILES_APP || defaultConfig.maxFiles.app,
    error: process.env.LOG_MAX_FILES_ERROR || defaultConfig.maxFiles.error,
    exceptions: process.env.LOG_MAX_FILES_EXCEPTIONS || defaultConfig.maxFiles.exceptions,
  },
  datePattern: process.env.LOG_DATE_PATTERN || defaultConfig.datePattern,
  zippedArchive: process.env.LOG_ZIPPED_ARCHIVE ? process.env.LOG_ZIPPED_ARCHIVE === 'true' : defaultConfig.zippedArchive,
  service: process.env.LOG_SERVICE_NAME || defaultConfig.service,
}; 