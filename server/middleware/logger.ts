import winston from 'winston';
import { environment } from '@config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }),
  new winston.transports.File({ filename: 'logs/combined.log' })
];

export const logger = winston.createLogger({
  level: environment === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports
});

if (environment === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
