import express, { Application, Request, Response } from "express";
import cors from "cors";
import jobRoutes from "./routes/job.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import helmet from "helmet";
import { apilimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import path from "path";
import uploadRoutes from "./routes/upload.routes";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

export function createApp(): Application {
  const app: Application = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [
          "http://localhost:3000",
          "http://localhost:5173",
          "https://job-tracker-api-production-5674.up.railway.app",
          "https://job-tracker-ui-iota.vercel.app/"
        ];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());
  app.use(apilimiter);
  app.use(requestLogger);

  app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".pdf")) {
          res.setHeader("Content-Disposition", "attachment");
        }
      },
    }),
  );

  // Swagger UI

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true, // remembers token between page refreshes
        displayRequestDuration: true,
        filter: true,
      },
    }),
  );

  // Serve raw OpenAPI spec as JSON (useful for Postman import)
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      docs: `http://localhost:${env.port}/api/docs`,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/jobs", uploadRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
