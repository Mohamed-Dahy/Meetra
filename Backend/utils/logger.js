/**
 * logger.js — lightweight structured logger for the Meetra backend.
 *
 * WHY: console.log is unstructured — it's a string blob that log aggregation
 * tools (Datadog, Render log drains, CloudWatch) can't parse. Structured JSON
 * logs (one JSON object per line) can be indexed, filtered, and alerted on.
 *
 * HOW:
 * - In production (NODE_ENV=production) every log line is a JSON object:
 *     {"level":"ERROR","message":"DB connection failed","ts":"2026-04-13T10:00:00.000Z","meta":{...}}
 *   Log drain tools ingest these and allow queries like level:ERROR or
 *   message:"DB connection" without regex.
 *
 * - In development the output is human-readable with colour codes so the
 *   terminal is easy to read while coding.
 *
 * USAGE:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started', { port: 5000 });
 *   logger.warn('Rate limit hit', { ip: req.ip });
 *   logger.error('Unhandled error', { stack: err.stack });
 */

const isProd = process.env.NODE_ENV === 'production';

// ANSI colour codes for dev output — stripped in prod (JSON has no colours)
const COLOURS = {
  INFO:  '\x1b[36m',   // cyan
  WARN:  '\x1b[33m',   // yellow
  ERROR: '\x1b[31m',   // red
  RESET: '\x1b[0m',
};

/**
 * Core log function.
 * @param {'INFO'|'WARN'|'ERROR'} level
 * @param {string} message
 * @param {object} [meta] - optional extra fields to include in the JSON log
 */
function log(level, message, meta = {}) {
  if (isProd) {
    // Single JSON line — one entry per log event, easy for log drains to ingest
    const entry = {
      level,
      message,
      ts: new Date().toISOString(),
      ...(Object.keys(meta).length ? { meta } : {}),
    };
    console.log(JSON.stringify(entry));
  } else {
    // Human-readable dev output: [LEVEL] message { meta }
    const colour = COLOURS[level] || '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${colour}[${level}]${COLOURS.RESET} ${message}${metaStr}`);
  }
}

const logger = {
  info:  (message, meta) => log('INFO',  message, meta),
  warn:  (message, meta) => log('WARN',  message, meta),
  error: (message, meta) => log('ERROR', message, meta),
};

module.exports = logger;
