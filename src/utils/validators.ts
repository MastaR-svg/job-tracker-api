// Day 2 Exercise: Type Guards for Request Validation

// Type Guards for Request Validation
// These help ensure that incoming data matches expected shapes,
// improving type safety and reducing runtime errors.

import { JobStatus } from "../types";

// TODO 4: Write a type guard that checks if a string is a valid JobStatus

export function isValidJobStatus(value: string): value is JobStatus {
  return Object.values(JobStatus).includes(value as JobStatus);
}

// TODO 5: Write a type guard that checks if a value is a valid email format

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// TODO 6: Write a function 'assertIsString' that throws if value isn't a string
// This is an "assertion function" — a special TypeScript feature

export function assertIsString(
  value: unknown,
  fieldName: string,
): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
}
