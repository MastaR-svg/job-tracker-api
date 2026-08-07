// Rate Limiting Middleware

import { rateLimit } from "express-rate-limit";

// General API limiter — applied to all routes
export const apilimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "TOO_MANY_REQUEST",
    message: "Too many request from IP, please try again in 15 minutes",
  },
});

export const authLimiter = rateLimit({
  // Strict limiter for auth endpoints — brute force protection
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/register attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "TOO_MANY_AUTH_ATTEMPS",
    message: "Too many authentication attempts, please try again in 15 minutes",
  },
});
