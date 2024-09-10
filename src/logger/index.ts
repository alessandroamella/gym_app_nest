import { join } from 'path';
import * as winston from 'winston';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';

// Configuration constants
const LOG_DIR = join(process.cwd(), 'logs');
const COMBINED_LOG_FILE = join(LOG_DIR, 'combined.log');
const ERROR_LOG_FILE = join(LOG_DIR, 'error.log');
const SERVICE_NAME = 'gym-app';

// Custom log formats
const jsonLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.ms(),
  winston.format.json(),
);

const consoleLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike(SERVICE_NAME, {
    prettyPrint: true,
  }),
);

// Transport configurations
const consoleTransport = new winston.transports.Console({
  format: consoleLogFormat,
});

const combinedFileTransport = new winston.transports.File({
  filename: COMBINED_LOG_FILE,
  maxsize: 10 * 1024 * 1024, // 10MB
});

const errorFileTransport = new winston.transports.File({
  filename: ERROR_LOG_FILE,
  level: 'error',
  maxsize: 20 * 1024 * 1024, // 20MB
});

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: jsonLogFormat,
  defaultMeta: { service: SERVICE_NAME },
  transports: [consoleTransport, combinedFileTransport, errorFileTransport],
};

// Create Winston logger
const createWinstonLogger = () => {
  return winston.createLogger(winstonConfig);
};

// Create Nest Winston logger
const createNestWinstonLogger = () => {
  const logger = createWinstonLogger();
  return WinstonModule.createLogger({
    instance: logger,
  });
};

export { createWinstonLogger, createNestWinstonLogger };
