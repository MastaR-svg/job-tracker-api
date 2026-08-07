// Auth Validation Chains

import { body } from "express-validator";

export const registerValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Must be valid email address")
    .bail()
    .isLength({ max: 254 })
    .withMessage("Email too long"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Username must be at least 2 characters")
    .bail()
    .isLength({ max: 30 })
    .withMessage("Username cannot exceed 30 characters")
    .bail()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, underscores"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    .isLength({ max: 30 })
    .withMessage("Username cannot exceed 30 characters")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

export const loginValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
];
