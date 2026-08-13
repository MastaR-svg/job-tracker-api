// Swagger / OpenAPI Configuration

import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

const servers =
  env.nodeEnv === "production"
    ? [
        {
          url: "https://job-tracker-api-production-5674.up.railway.app",
          description: "Production server",
        },
      ]
    : [
        {
          url: `https://localhost:${env.port}`,
          description: "Development server",
        },
      ];

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Tracker API",
      version: "1.0.0",
      description: `
A production-grade REST API for tracking job applications.

## Features
- JWT authentication with refresh tokens
- Full CRUD for job applications
- Advanced search, filtering, and pagination
- File uploads for resumes/CVs
- Email notifications
- Dashboard analytics

## Authentication
This API uses Bearer token authentication.
1. Register or login to get an access token
2. Click **Authorize** and enter: \`Bearer YOUR_TOKEN\`
3. All protected endpoints will use this token automatically
            `,
      contact: {
        name: "Clement",
        url: "https://github.com/MastaR-svg/job-tracker-api",
      },
      license: {
        name: "MIT",
      },
    },
    servers,
    security: [{ bearerAuth: [] }], // apply auth globally
  },
  // Where to find JSDoc comments — scans these files for @swagger tags
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./src/config/swagger.schemas.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
