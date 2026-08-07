// Auth Service — Registration and Login business logic

import { env } from "../config/env";
import { IUserDocument } from "../models/user.model";
import { IUserRepository } from "../repositories/user.repository";
import { AuthResponse, LoginDto, PublicUser, RegisterDto } from "../types";
import { emailQueue } from "../utils/emailQueue";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import { TokenService } from "./token.service";
import { tokenBlacklistService } from "./tokenBlacklist.service";

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: TokenService,
  ) {}

  // Helpers

  private toPublicUser(user: IUserDocument): PublicUser {
    return {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateAuthResponse(
    user: IUserDocument,
  ): AuthResponse & { refreshToken: string } {
    const publicUser = this.toPublicUser(user);
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
    });
    return {
      user: publicUser,
      token: accessToken,
      refreshToken,
      expiresIn: env.accessTokenExpiresIn,
    };
  }

  // Registration

  async register(
    data: RegisterDto,
  ): Promise<AuthResponse & { refreshToken: string }> {
    if (!data.email?.trim()) {
      throw new ValidationError("Email is required");
    }
    if (!data.username?.trim()) {
      throw new ValidationError("Username is required");
    }
    if (!data.password || data.password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    // Check for duplicate email
    const exists = await this.userRepository.emailExists(data.email);
    if (exists) {
      throw new ConflictError("An account with this email already exists");
    }

    const user = await this.userRepository.create(data);

    emailQueue.sendWelcomeEmail({
      to: user.email,
      username: user.username,
    });

    return this.generateAuthResponse(user);
  }

  // Login

  async login(
    data: LoginDto,
  ): Promise<AuthResponse & { refreshToken: string }> {
    if (!data.email?.trim() || !data.password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }
    return this.generateAuthResponse(user);
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded;
    try {
      decoded = this.tokenService.verifyToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    if (decoded.type !== "refresh" || !decoded.jti) {
      throw new UnauthorizedError("Invalid token type");
    }

    const blacklisted = await tokenBlacklistService.isBlacklisted(decoded.jti);
    if (blacklisted) {
      throw new UnauthorizedError(
        "Token has been revoked. Please log in again,",
      );
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) throw new UnauthorizedError("User no longer exists");

    const oldTtl = this.tokenService.getRemainingTtl(decoded.exp!);
    await tokenBlacklistService.blacklist(decoded.jti, oldTtl);

    const { accessToken, refreshToken: newRefreshToken } =
      this.tokenService.generateTokenPair({
        userId: user._id.toString(),
        email: user.email,
      });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = this.tokenService.verifyToken(refreshToken);
      if (decoded.jti && decoded.exp) {
        const ttl = this.tokenService.getRemainingTtl(decoded.exp);
        await tokenBlacklistService.blacklist(decoded.jti, ttl);
      }
    } catch {
      // Token is already invalid — logout is still successful
    }
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }
    return this.toPublicUser(user);
  }
}
