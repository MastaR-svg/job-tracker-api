// MongoDB Connection Manager
// Handles connect, disconnect, and connection events.

import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on("connected", () => {
    logger.info("✅ MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️  MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("❌ MongoDB connection error:", { error: err.message });
  });

  try {
    await mongoose.connect(env.mongoUri, {
      // These options prevent deprecation warnings and set sane defaults
      dbName: "job-tracker",
    });

    try {
      await mongoose.connection
        .collection("jobs")
        .dropIndex("userId_1_company_text");
      logger.info("✅ Dropped old text index");
    } catch (e) {
      logger.info("No old text index to drop — continuing");
    }

    const { JobModel } = await import("../models/job.model");
    await JobModel.syncIndexes();
    logger.info("✅ Indexes synced");
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB:", {
      error: (error as Error).message,
    });
    process.exit(1); // kill the process — no point running without a database
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("🔌 MongoDB disconnected cleanly");
}
