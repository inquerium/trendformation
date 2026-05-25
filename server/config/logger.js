import winston from 'winston';

const { combine, timestamp, colorize, printf } = winston.format;

const fmt = printf(({ level, message, timestamp: ts }) => `${ts} [${level}] ${message}`);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'HH:mm:ss' }), colorize(), fmt),
  transports: [new winston.transports.Console()],
});
