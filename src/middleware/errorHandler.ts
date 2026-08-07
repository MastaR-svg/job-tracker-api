// Global Error Handler Middleware

import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../utils/errors";
import { env } from "../config/env";
import { logger } from "../config/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Mongoose validation error → 400
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      error: "ValidationError",
      message: messages.join(", "),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Mongoose Duplicate Key Error → 409
  if ((err as NodeJS.ErrnoException).code === "11000") {
    res.status(409).json({
      success: false,
      error: "ConflictError",
      message: "A record with this value already exists",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Known operational AppError
  if (err instanceof AppError) {
    // Only log 500s as errors — 4xx are expected client mistakes
    if (err.statusCode >= 500) {
      logger.error(`${req.method} ${req.path} — ${err.message}`, {
        statusCode: err.statusCode,
        stack: err.stack,
      });
    } else {
      logger.warn(`${req.method} ${req.path} — ${err.message}`, {
        statusCode: err.statusCode,
      });
    }

    res.status(err.statusCode).json({
      success: false,
      error: err.constructor.name,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Unknown error — log full details server-side
  logger.error(`Unhandled error on ${req.method} ${req.path}`, {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message:
      env.nodeEnv === "production" ? "Something went wrong" : err.message,
    timestamp: new Date().toISOString(),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
}
