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

// All job routes are protected — protect runs before every handler
router.use(protect);

router.get("/dashboard", asyncHandler(jobController.getDashboard));
router.get("/stats", asyncHandler(jobController.getStats));
router.get(
  "/",
  jobQueryValidators,
  validate,
  asyncHandler(jobController.getAll),
);
router.get("/:id", asyncHandler(jobController.getById));
router.post(
  "/",
  createJobValidators,
  validate,
  asyncHandler(jobController.create),
);
router.patch(
  "/:id",
  updateJobValidators,
  validate,
  asyncHandler(jobController.update),
);
router.delete("/:id", asyncHandler(jobController.delete));

export default router;
