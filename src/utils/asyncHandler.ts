// Async Handler Wrapper — eliminates repeated try/catch in routes

import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: any,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
