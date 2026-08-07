import dotenv from "dotenv";
import { logger } from "../config/logger";

dotenv.config();

interface EnvConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;

  emailHost: string;
  emailPort: number;
  emailUser: string;
  emailPass: string;
  emailFrom: string;

  redisUrl: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function parseNodeEnv(value: string): EnvConfig["nodeEnv"] {
  const validEnvs = ["development", "production", "test"];
  if (validEnvs.includes(value as EnvConfig["nodeEnv"])) {
    return value as EnvConfig["nodeEnv"];
  }
  throw new Error(
    `NODE_ENV must be one of: ${validEnvs.join(", ")}. Got: ${value}`,
  );
}

export const env: EnvConfig = {
  nodeEnv: parseNodeEnv(getOptionalEnv("NODE_ENV", "development")),
  port: Number(getOptionalEnv("PORT", "5000")),
  mongoUri: getRequiredEnv("MONGODB_URI"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: getOptionalEnv("JWT_EXPIRES_IN", "7d"),
  bcryptSaltRounds: Number(getOptionalEnv("BCRYPT_SALT_ROUNDS", "10")),

  emailHost: getOptionalEnv("EMAIL_HOST", "smtp.ethereal.email"),
  emailPort: Number(getOptionalEnv("EMAIL_PORT", "587")),
  emailUser: getOptionalEnv("EMAIL_USER", ""),
  emailPass: getOptionalEnv("EMAIL_PASS", ""),
  emailFrom: getOptionalEnv(
    "EMAIL_FROM",
    "Job Tracker <noreply@jobtracker.com>",
  ),

  redisUrl: getOptionalEnv("REDIS_URL", "redis://localhost:6379"),
  accessTokenExpiresIn: getOptionalEnv("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  refreshTokenExpiresIn: getOptionalEnv("REFRESH_TOKEN_EXPIRES_IN", "7d"),
};

if (Number.isNaN(env.port)) {
  throw new Error("❌ PORT must be a valid number");
}

if (env.jwtSecret.length < 16) {
  throw new Error("❌ JWT_SECRET must be at least 16 characters for security");
}

dotenv.config({ quiet: process.env.NODE_ENV === "test" });

logger.info(`✅ Environment config loaded for: ${env.nodeEnv}`);
