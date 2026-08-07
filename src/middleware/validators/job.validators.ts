// Job Validation Chains

import { body, query } from "express-validator";
import { JobStatus } from "../../types";
import { SortField, SortOrder } from "../../repositories/job.repository";

export const createJobValidators = [
  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 100 })
    .withMessage("Company cannot exceed 100 characters")
    .escape(), //  // converts <, >, &, ', " to HTML entities — XSS prevention

  body("position")
    .trim()
    .notEmpty()
    .withMessage("Position is required")
    .isLength({ max: 100 })
    .withMessage("Position cannot exceed 100 characters")
    .escape(),

  body("status")
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage(
      `Status must be one of: ${Object.values(JobStatus).join(", ")}`,
    ),

  body("appliedDate")
    .optional()
    .isISO8601()
    .withMessage("Applied date must be a valid date (YYYY-MM-DD)")
    .toDate(), // converts string to Date object automatically

  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Salary cannot be negative"),

  body("jonUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Job URL must be a valid URL"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Notes cannot exceed 2000 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters")
    .escape(),
];

export const updateJobValidators = [
  // All fields optional for PATCH — only validate what's present
  body("company")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be empty").bail()
    .isLength({ max: 100 })
    .withMessage("Company cannot exceed 100 characters")
    .escape(),

  body("position")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Position cannot be empty").bail()
    .isLength({ max: 100 })
    .withMessage("Position cannot exceed 100 characters")
    .escape(),

  body("status")
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage(
      `Status must be one of: ${Object.values(JobStatus).join(", ")}`,
    ),

  body("appliedDate")
    .optional()
    .isISO8601()
    .withMessage("Applied date must be a valid date)")
    .toDate(),

  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be a number")
    .isFloat({ min: 0 })
    .withMessage("Salary cannot be negative"),

  body("jonUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Job URL must be a valid URL"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Notes cannot exceed 2000 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters")
    .escape(),
];

export const jobQueryValidators = [
  query("status")
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage(
      `Status must be one of: ${Object.values(JobStatus).join(", ")}`,
    ),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "appliedDate", "company", "salary"] as SortField[])
    .withMessage(
      "sortBy must be one of: createdAt, appliedDate, company, salary",
    ),

  query("sortOder")
    .optional()
    .isIn(["asc", "desc"] as SortOrder[])
    .withMessage("sortOder must be asc or desc"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50"),

  query("dateForm")
    .optional()
    .isISO8601()
    .withMessage("dateForm must be a valid date (YYYY-MM-DD)"),

  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("dateTo must be a valid date (YYYY-MM-DD)"),
];
