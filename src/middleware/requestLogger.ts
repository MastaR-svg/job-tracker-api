// HTTP Request Logger — replaces the manual console.log
// Morgan captures request details; Winston writes the log.

import morgan, { StreamOptions } from "morgan";
import { logger } from "../config/logger";
import { Request, Response } from "express";
import { env } from "../config/env";

// Pipe Morgan's output into Winston
const stream: StreamOptions = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Custom token — response time in ms
morgan.token("response-time-ms", (_req: Request, res: Response) => {
  return `${res.getHeader("X-Response-Time") || "?"}ms`;
});

// Format:  POST /api/auth/login 200 45ms
const format =
  env.nodeEnv === "production"
    ? "combined" // Apache combined format — standard for prod log aggregators
    : ":method :url :status :response-time ms";

export const requestLogger = morgan(format, { stream });
