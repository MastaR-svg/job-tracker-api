import { Request as ExpressRequest, Response } from "express";
import { IUserDocument } from "../models/user.model";
import { JobService } from "../services/job.service";
import { handleResumeUpload } from "../middleware/upload";
import { NotFoundError, ValidationError } from "../utils/errors";
import { uploadService } from "../services/upload.service";
import { createSuccessResponse } from "../utils/response";

interface AuthRequest extends ExpressRequest {
  user: IUserDocument;
}

export class UploadController {
  constructor(private jobService: JobService) {}

  uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user._id.toString();
    const jobId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!jobId) {
      throw new ValidationError("Job ID is required");
    }

    const job = await this.jobService.getJobById(jobId, userId);

    await handleResumeUpload(req, res as any);

    if (!req.file) {
      throw new ValidationError(
        "No file provided. Include a resume field in the form.",
      );
    }

    if (job.resumeUrl) {
      uploadService.deleteResume(job.resumeUrl);
    }

    const resumeUrl = uploadService.getResumeUrl(req.file.filename);

    const updatedJob = await this.jobService.updateJob(jobId, userId, {
      resumeUrl,
    });

    res
      .status(200)
      .json(createSuccessResponse(updatedJob, "Resume upload successfully"));
  };

  deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user._id.toString();
    const jobId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!jobId) {
      throw new ValidationError("Job ID is required");
    }

    const job = await this.jobService.getJobById(jobId, userId);

    if (!job.resumeUrl) {
      throw new NotFoundError("Resume");
    }

    uploadService.deleteResume(job.resumeUrl);

    const updatedJob = await this.jobService.removeResume(jobId, userId);

    res
      .status(200)
      .json(createSuccessResponse(updatedJob, "Resume deleted successfully"));
  };
}
