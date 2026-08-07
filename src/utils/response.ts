// API Response Helper Utilities

import { ApiResponse, ErrorResponse, PaginatedResponse } from "../types";

/**
 * Creates a standardized success response.
 * Every successful API response goes through this function.
 */

export function createSuccessResponse<T>(
  data: T,
  message: string = "Success",
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a standardized error response.
 */

export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
): ErrorResponse {
  return {
    success: false,
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

// TODO 5: Write a function called 'createPaginatedResponse'
// It should accept: data array, total count, page, limit
// It should return a PaginatedResponse<T>

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  totalPages: number,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages,
    timestamp: new Date().toISOString(),
  };
}
