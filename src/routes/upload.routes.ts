import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { MongoJobRepository } from "../repositories/mongo-job.repository";
import { JobService } from "../services/job.service";
import { protect } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { MongoUserRepository } from "../repositories/user.repository";

const jobRepository = new MongoJobRepository();
const userRepository = new MongoUserRepository();
const jobService = new JobService(jobRepository, userRepository);
const uploadController = new UploadController(jobService);

const router = Router();

router.use(protect);

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
 *         description: Job application ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [resume]
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF, DOC, or DOCX file (max 5MB)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
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
 *         description: Invalid file type or no file provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job not found
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/resume", asyncHandler(uploadController.uploadResume));

/**
 * @swagger
 * /api/jobs/{id}/resume:
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
 *         description: Job application ID
 *     responses:
 *       200:
 *         description: Resume deleted successfully
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
 *         description: Resume or job not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id/resume", asyncHandler(uploadController.deleteResume));

export default router;
