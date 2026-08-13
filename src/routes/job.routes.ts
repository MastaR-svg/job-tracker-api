// Job Routes — Wires HTTP verbs + paths to controller methods

import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import { JobService } from "../services/job.service";
import { asyncHandler } from "../utils/asyncHandler";
import { MongoJobRepository } from "../repositories/mongo-job.repository";
import { protect } from "../middleware/auth.middleware";
import {
  createJobValidators,
  jobQueryValidators,
  updateJobValidators,
} from "../middleware/validators/job.validators";
import { validate } from "../middleware/validate";
import { MongoUserRepository } from "../repositories/user.repository";

// Manual Dependency Injection (composition root)
// This is the ONE place where concrete classes are wired together.
// Everywhere else only sees interfaces.

const jobRepository = new MongoJobRepository();
const userRepository = new MongoUserRepository();
const jobService = new JobService(jobRepository, userRepository);
const jobController = new JobController(jobService);

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job application management
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all job applications (paginated)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Results per page
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/JobStatus'
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search across company, position, location, notes
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, appliedDate, company, salary]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by applied date (from)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by applied date (to)
 *     responses:
 *       200:
 *         description: Paginated list of job applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedJobResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// All job routes are protected — protect runs before every handler
router.use(protect);

/**
 * @swagger
 * /api/jobs/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 */

router.get("/dashboard", asyncHandler(jobController.getDashboard));

/**
 * @swagger
 * /api/jobs/stats:
 *   get:
 *     summary: Get job status counts
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status breakdown counts
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         applied:
 *                           type: integer
 *                         interview:
 *                           type: integer
 *                         assessment:
 *                           type: integer
 *                         offer:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 */
router.get("/stats", asyncHandler(jobController.getStats));

router.get(
  "/",
  jobQueryValidators,
  validate,
  asyncHandler(jobController.getAll),
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job application
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job application ID
 *     responses:
 *       200:
 *         description: Job application details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 *   patch:
 *     summary: Update a job application
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJobDto'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a job application
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", asyncHandler(jobController.getById));

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job application
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobDto'
 *     responses:
 *       201:
 *         description: Job application created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  createJobValidators,
  validate,
  asyncHandler(jobController.create),
);

/**
 * @swagger
 * /api/jobs/{id}/resume:
 *   post:
 *     summary: Upload a resume for a job application
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF, DOC, or DOCX file (max 5MB)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid file type or no file provided
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Remove resume from a job application
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *       404:
 *         description: Resume or job not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id",
  updateJobValidators,
  validate,
  asyncHandler(jobController.update),
);
router.delete("/:id", asyncHandler(jobController.delete));

export default router;
