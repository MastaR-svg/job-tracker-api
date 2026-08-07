// Auth Controller — HTTP layer for auth endpoints

import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";
import { createSuccessResponse } from "../utils/response";
import { IUserDocument } from "../models/user.model";
import { ValidationError } from "../utils/errors";

interface AuthRequest extends Request {
  user: IUserDocument;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxxAge: 7 * 24 * 60 * 1000, // & days
};

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json(
      createSuccessResponse(
        {
          user: result.user,
          token: result.token,
          expiresIn: result.expiresIn,
        },
        "Registration successful",
      ),
    );
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
    res.status(200).json(
      createSuccessResponse(
        {
          user: result.user,
          token: result.token,
          expiresIn: result.expiresIn,
        },
        "Login successfull",
      ),
    );
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ValidationError("No refresh token provided");
    }

    const tokens = await this.authService.refresh(refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);
    res
      .status(200)
      .json(
        createSuccessResponse(
          { token: tokens.accessToken, expiresIn: "15m" },
          "Token refreshed successfully",
        ),
      );
  };

  logout = async (req: any, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .json(createSuccessResponse(null, "Logged out successfully"));
  };

  getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await this.authService.getMe(req.user._id.toString());
    res
      .status(200)
      .json(createSuccessResponse(user, "User retrieved successfully"));
  };
}
