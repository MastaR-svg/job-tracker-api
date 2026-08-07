// Validation Middleware
// Reads express-validator results and short-circuits with 400
// if any validation rule failed. Used after validator chains
// in route definitions, before the controller handler.

import { Request, Response, NextFunction } from "express";
import { ValidationError, validationResult } from "express-validator";

export function validate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format all validation errors into a clean array
    const formatted = errors.array().map((err: ValidationError) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
    }));

    res.status(400).json({
      success: false,
      error: "ValidationError",
      message: "Invalid request data",
      errors: formatted,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}
