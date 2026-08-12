import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectRedis, disconnectRedis } from "./config/redis";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();

  const server = app.listen(env.port, "0.0.0.0", () => {
    logger.info(`🚀 Server running on http://localhost:${env.port}`);
    logger.info(`📍 Environment: ${env.nodeEnv}`);
    logger.info(`❤️  Health check: http://localhost:${env.port}/health`);
  });

  // Graceful Shutdown

  // When the process receives SIGTERM (from Docker, Kubernetes, PM2)
  // or SIGINT (Ctrl+C), stop accepting new requests, finish existing
  // ones, then close the database connection cleanly.
  // Without this, in-flight requests get cut off mid-response.

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection", { reason });
  });
}

bootstrap().catch((err) => {
  logger.error("❌ Failed to start server:", { error: err.message });
  process.exit(1);
});
