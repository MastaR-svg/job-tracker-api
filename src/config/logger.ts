// Winston Logger Configuration
// Single logger instance used everywhere in the app.
// Import this instead of using console.log directly.

import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const isTest = nodeEnv === "test";

// Dev format — readable, colorized

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    // meta contains any extra fields passed to the logger
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";

    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  }),
);

// Prod format — structured JSON

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(), // outputs {"level":"info","message":"...","timestamp":"..."}
);

// Logger instance

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),

    // In production you'd add file or cloud transports:
    // new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // new winston.transports.File({ filename: "logs/combined.log" })
  ],
  // Don't crash the process on unhandled logger errors
  exitOnError: false,
});

// Silence logger during tests — keep test output clean

if (isTest) {
  logger.silent = true;
}
