import { Request, Response, NextFunction } from "express";
import { IUserDocument } from "../models/user.model";
import { tokenService } from "../services/token.service";
import { UserModel } from "../models/user.model";
import { UnauthorizedError } from "../utils/errors";
import { TokenExpiredError } from "jsonwebtoken";

// Extend locally — same pattern as the controller
interface AuthRequest extends Request {
  user?: IUserDocument;
}

export async function protect(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = tokenService.extractFromHeader(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError("No token provided. Please log in.");
    }

    let decoded;
    try {
      decoded = tokenService.verifyToken(token);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedError("Your session has expired. Please log in again.");
      }
      throw new UnauthorizedError("Invalid token. Please log in.");
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists.");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
