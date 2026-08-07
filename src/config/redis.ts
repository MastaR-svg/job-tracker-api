import { createClient, RedisClientType } from "redis";
import { env } from "./env";
import { logger } from "./logger";

let redisClient: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient) return redisClient;

  redisClient = createClient({ url: env.redisUrl }) as RedisClientType;

  redisClient.on("error", (err) => {
    logger.error("Redis connection error", { error: err.message });
  });

  redisClient.on("connect", () => {
    logger.info("✅ Redis connected");
  });

  redisClient.on("reconnecting", () => {
    logger.warn("⚠️  Redis reconnecting");
  });

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
    logger.info("Redis disconnected cleanly");
  }
}
