// Token Service — JWT sign and verify
// Isolated here so the algorithm/secret details live in one place.
// If you ever rotate to RS256 (asymmetric), only this file changes.

import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload } from "../types";
import { randomUUID } from "crypto";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenJti: string;
}

export class TokenService {
  generateAccessToken(payload: AuthTokenPayload): string {
    return jwt.sign({ ...payload, type: "access" }, env.jwtSecret, {
      expiresIn: env.accessTokenExpiresIn,
    } as jwt.SignOptions);
  }

  generateRefreshToken(payload: AuthTokenPayload): {
    token: string;
    jti: string;
  } {
    const jti = randomUUID();

    const token = jwt.sign(
      { ...payload, type: "refresh", jti },
      env.jwtSecret,
      { expiresIn: env.refreshTokenExpiresIn } as jwt.SignOptions,
    );
    return { token, jti };
  }

  generateTokenPair(payload: AuthTokenPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const { token: refreshToken, jti } = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      refreshTokenJti: jti,
    };
  }

  verifyToken(token: string): AuthTokenPayload & {jti?: string; type?: string} {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded as AuthTokenPayload & {jti?: string; type?: string};
  }

  extractFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader?.startsWith("Bearer")) return null;
    const token = authHeader.split(" ")[1];
    return token?.trim() || null;
  }

  getRemainingTtl(exp: number): number {
    return Math.max(0, exp - Math.floor(Date.now() / 1000));
  }
}

export const tokenService = new TokenService();
