// Day 2 Exercise: Discriminated Union Result Type
// This pattern will replace throwing raw errors in your services

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// TODO 1: Write a helper function 'ok' that wraps a value into a success Result

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

// TODO 2: Write a helper function 'fail' that wraps an error into a failure Result

export function fail<E = string>(error: E): Result<never, E> {
  return { success: false, error };
}

// TODO 3: Write a function 'isOk' as a type guard for Result<T, E>

export function isOk<T, E>(
  result: Result<T, E>,
): result is { success: true; data: T } {
  return result.success;
}
