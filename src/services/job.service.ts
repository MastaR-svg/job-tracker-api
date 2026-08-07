// Job Service — Business Logic Layer

import {
  IJobRepository,
  QueryOptions,
  SortField,
  SortOrder,
} from "../repositories/job.repository";
import { IUserRepository } from "../repositories/user.repository";
import {
  CreateJobDto,
  JobApplication,
  UpdateJobDto,
  JobStatus,
  PaginatedResponse,
  DashboardStats,
} from "../types";
import { emailQueue } from "../utils/emailQueue";
import { NotFoundError } from "../utils/errors";

export class JobService {
  constructor(
    private jobRepository: IJobRepository,
    private userRepository?: IUserRepository,
  ) {}

  async getJobById(id: string, userId: string): Promise<JobApplication> {
    const job = await this.jobRepository.findById(id, userId);
    if (!job) throw new NotFoundError("Job application");
    return job;
  }

  async getAllJobs(
    userId: string,
    options: {
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      dateForm?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<JobApplication>> {
    // Parse and clamp pagination values — never trust raw query params
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));

    const queryOptions: QueryOptions = {
      status: options.status,
      search: options.search,
      sortBy: options.sortBy as SortField,
      sortOrder: options.sortOrder as SortOrder,
      dateForm: options.dateForm,
      dateTo: options.dateTo,
      page,
      limit,
    };

    const { jobs, total } = await this.jobRepository.findByAllPaginated(
      userId,
      queryOptions,
    );

    return {
      success: true,
      data: jobs,
      message: "Jobs retrieved successfully",
      timestamp: new Date().toISOString(),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createJob(userId: string, data: CreateJobDto): Promise<JobApplication> {
    return this.jobRepository.create(userId, data);
  }

  async updateJob(
    id: string,
    userId: string,
    data: UpdateJobDto,
  ): Promise<JobApplication> {
    const updated = await this.jobRepository.update(id, userId, data);
    if (!updated) throw new NotFoundError("Job application");

    if (data.status && this.userRepository) {
      const user = await this.userRepository.findById(userId);
      if (user) {
        emailQueue.sendStatusChangeEmail({
          to: user.email,
          username: user.username,
          company: updated.company,
          position: updated.position,
          newStatus: data.status,
        });
      }
    }
    return updated;
  }

  async deleteJob(id: string, userId: string): Promise<void> {
    const deleted = await this.jobRepository.delete(id, userId);
    if (!deleted) throw new NotFoundError("Job application");
  }

  async getJobStats(userId: string): Promise<Record<JobStatus, number>> {
    return this.jobRepository.getStatusCounts(userId);
  }

  async getDashboard(userId: string): Promise<DashboardStats> {
    // All three queries run in parallel — single round-trip time
    const [statusBreakdown, recentApplications, totalApplications] =
      await Promise.all([
        this.jobRepository.getStatusCounts(userId),
        this.jobRepository.getRecentJobs(userId, 5),
        this.jobRepository.getTotalCount(userId),
      ]);

    const offerCount = statusBreakdown[JobStatus.Offer];
    const successRate =
      totalApplications > 0
        ? Math.round((offerCount / totalApplications) * 100 * 10) / 10 // 1 decimal place
        : 0;

    return {
      totalApplications,
      statusBreakdown,
      recentApplications,
      successRate,
    };
  }

  async removeResume(id: string, userId: string): Promise<JobApplication> {
    const updated = await this.jobRepository.unsetResumeUrl(id, userId);
    if (!updated) throw new NotFoundError("Job application");
    return updated;
  }
}
