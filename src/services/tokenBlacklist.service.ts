import { logger } from "../config/logger";
import { getRedisClient } from "../config/redis";

export class TokenBlacklistService {
  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setEx(`blacklist:${jti}`, ttlSeconds, "1");
      logger.info(`Token blacklisted: ${jti}`);
    } catch (err) {
      logger.error("Failed to blacklist token", {
        jti,
        error: (err as Error).message,
      });
    }
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const exists = await redis.exists(`blacklist:${jti}`);
      return exists === 1;
    } catch (err) {
      logger.error("Failed to check token blacklist", {
        jti,
        error: (err as Error).message,
      });
      return true; // If there's an error, assume the token is blacklisted for safety
    }
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
