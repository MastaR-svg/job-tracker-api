// Job Controller — HTTP Layer Only
// Extracts request data, calls the service, formats the response.
// NO business logic lives here.

// Job Controller — HTTP Layer Only

import { Request, Response } from "express";
import { IUserDocument } from "../models/user.model";
import { JobService } from "../services/job.service";
import { createSuccessResponse } from "../utils/response";

// ── Custom request types ───────────────────────────────────────
// Explicitly typed instead of relying on global declaration merging.
// 'user' is non-optional here — protect middleware guarantees it exists
// before any of these handlers run.

interface AuthRequest extends Request {
  user: IUserDocument;
}

interface AuthParamRequest extends AuthRequest {
  params: { id: string };
}

// ── Controller ────────────────────────────────────────────────

export class JobController {
  constructor(private jobService: JobService) {}

  private getUserId(req: AuthRequest): string {
    return req.user._id.toString();
  }

  getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.jobService.getAllJobs(this.getUserId(req), {
      status:
        typeof req.query.status === "string" ? req.query.status : undefined,
      search:
        typeof req.query.search === "string" ? req.query.search : undefined,
      sortBy:
        typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
      sortOrder:
        typeof req.query.sortOrder === "string"
          ? req.query.sortOrder
          : undefined,
      dateForm:
        typeof req.query.dateForm === "string" ? req.query.dateForm : undefined,
      dateTo:
        typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
      page: typeof req.query.page === "string" ? Number(req.query.page) : 1,
      limit: typeof req.query.limit === "string" ? Number(req.query.limit) : 10,
    });

    // getAllJobs now returns PaginatedResponse directly — send it as-is
    res.status(200).json(result);
  };

  getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await this.jobService.getDashboard(this.getUserId(req));
    res
      .status(200)
      .json(createSuccessResponse(stats, "Dashboard retrieved successfully"));
  };

  getById = async (req: AuthParamRequest, res: Response): Promise<void> => {
    const job = await this.jobService.getJobById(
      req.params.id,
      this.getUserId(req),
    );
    res
      .status(200)
      .json(createSuccessResponse(job, "Job retrieved successfully"));
  };

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    const job = await this.jobService.createJob(this.getUserId(req), req.body);
    res
      .status(201)
      .json(createSuccessResponse(job, "Job created successfully"));
  };

  update = async (req: AuthParamRequest, res: Response): Promise<void> => {
    const job = await this.jobService.updateJob(
      req.params.id,
      this.getUserId(req),
      req.body,
    );
    res
      .status(200)
      .json(createSuccessResponse(job, "Job updated successfully"));
  };

  delete = async (req: AuthParamRequest, res: Response): Promise<void> => {
    await this.jobService.deleteJob(req.params.id, this.getUserId(req));
    res
      .status(200)
      .json(createSuccessResponse(null, "Job deleted successfully"));
  };

  getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await this.jobService.getJobStats(this.getUserId(req));
    res
      .status(200)
      .json(createSuccessResponse(stats, "Stats retrieved successfully"));
  };
}
