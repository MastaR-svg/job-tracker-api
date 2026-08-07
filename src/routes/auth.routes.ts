// Auth Routes

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { MongoUserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { tokenService } from "../services/token.service";
import { asyncHandler } from "../utils/asyncHandler";
import { protect } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter";
import {
  loginValidators,
  registerValidators,
} from "../middleware/validators/auth.validators";
import { validate } from "../middleware/validate";

// Dependency injection
const userRepository = new MongoUserRepository();
const authService = new AuthService(userRepository, tokenService);
const authController = new AuthController(authService);

const router = Router();

// Public routes — no token required
// Auth routes get their OWN stricter rate limiter on top of the global one
router.post(
  "/register",
  authLimiter,
  registerValidators,
  validate,
  asyncHandler(authController.register),
);
router.post(
  "/login",
  authLimiter,
  loginValidators,
  validate,
  asyncHandler(authController.login),
);

router.post("/refresh", authLimiter, asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));

// Protected routes — token required
router.get("/me", protect, asyncHandler(authController.getMe));

export default router;
