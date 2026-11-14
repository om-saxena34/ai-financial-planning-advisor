const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');

const { combine, timestamp, printf, colorize, errors, json } = format;

const NODE_ENV = process.env.NODE_ENV || 'development';

/* ── Custom dev-friendly format ────────────────────────────────────── */
const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

/* ── Winston logger ────────────────────────────────────────────────── */
const logger = createLogger({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    new transports.Console({
      format:
        NODE_ENV === 'development'
          ? combine(colorize({ all: true }), devFormat)
          : combine(json()),
    }),
  ],
});

/* ── Morgan → Winston bridge ───────────────────────────────────────── */
const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

const morganMiddleware = morgan('combined', { stream: morganStream });

module.exports = { logger, morganMiddleware };
