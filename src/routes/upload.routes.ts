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

router.post("/:id/resume", asyncHandler(uploadController.uploadResume));

router.delete("/:id/resume", asyncHandler(uploadController.deleteResume));

export default router;
