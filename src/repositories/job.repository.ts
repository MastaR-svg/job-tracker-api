// Job Repository — In-Memory Implementation
// Implements IJobRepository so it's a drop-in replacement for
// the future MongoJobRepository (Week 3) — zero changes needed
// in JobService or JobController when we swap it.

import { randomUUID } from "crypto";
import {
  CreateJobDto,
  JobApplication,
  JobStatus,
  UpdateJobDto,
} from "../types";

// Sort options

export type SortField = "createdAt" | "appliedDate" | "company" | "salary";
export type SortOrder = "asc" | "desc";

export interface QueryOptions {
  status?: string;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  dateForm?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface IJobRepository {
  findById(id: string, userId: string): Promise<JobApplication | null>;
  findByAllPaginated(
    userId: string,
    options: QueryOptions,
  ): Promise<{ jobs: JobApplication[]; total: number }>;
  create(userId: string, data: CreateJobDto): Promise<JobApplication>;
  update(
    id: string,
    userId: string,
    data: UpdateJobDto,
  ): Promise<JobApplication | null>;
  delete(id: string, userId: string): Promise<boolean>;
  getStatusCounts(userId: string): Promise<Record<JobStatus, number>>;
  getRecentJobs(userId: string, limit: number): Promise<JobApplication[]>;
  getTotalCount(userId: string): Promise<number>;
  unsetResumeUrl(id: string, userId: string): Promise<JobApplication | null>;
}

export interface QueryOptions {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

export class InMemoryJobRepository implements IJobRepository {
  private jobs: JobApplication[] = [];

  async findById(id: string, userId: string): Promise<JobApplication | null> {
    return this.jobs.find((j) => j._id === id && j.userId === userId) ?? null;
  }

  async findByAllPaginated(
    userId: string,
    options: QueryOptions,
  ): Promise<{ jobs: JobApplication[]; total: number }> {
    let filtered = this.jobs.filter((j) => j.userId === userId);

    if (options.status) {
      filtered = filtered.filter((j) => j.status === options.status);
    }

    if (options.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      filtered = filtered.filter((j) => j.company.toLowerCase().includes(term));
    }

    const total = filtered.length;
    const skip = (options.page - 1) * options.limit;
    const jobs = filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + options.limit);

    return { jobs, total };
  }

  async create(userId: string, data: CreateJobDto): Promise<JobApplication> {
    const now = new Date();
    const newJob: JobApplication = {
      _id: randomUUID(),
      userId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateJobDto,
  ): Promise<JobApplication | null> {
    const index = this.jobs.findIndex(
      (j) => j._id === id && j.userId === userId,
    );
    if (index === -1) return null;
    this.jobs[index] = { ...this.jobs[index], ...data, updatedAt: new Date() };
    return this.jobs[index];
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const index = this.jobs.findIndex(
      (j) => j._id === id && j.userId === userId,
    );
    if (index === -1) return false;
    this.jobs.splice(index, 1);
    return true;
  }

  async getStatusCounts(userId: string): Promise<Record<JobStatus, number>> {
    const { jobs } = await this.findByAllPaginated(userId, {
      page: 1,
      limit: 99999,
    });

    const counts: Record<JobStatus, number> = {
      [JobStatus.Applied]: 0,
      [JobStatus.Interview]: 0,
      [JobStatus.Assessment]: 0,
      [JobStatus.Offer]: 0,
      [JobStatus.Rejected]: 0,
    };

    for (const job of jobs) {
      counts[job.status]++;
    }
    return counts;
  }

  async getRecentJobs(
    userId: string,
    limit: number,
  ): Promise<JobApplication[]> {
    const { jobs } = await this.findByAllPaginated(userId, { page: 1, limit });
    return jobs;
  }

  async getTotalCount(userId: string): Promise<number> {
    return this.jobs.filter((j) => j.userId === userId).length;
  }

  async unsetResumeUrl(
    id: string,
    userId: string,
  ): Promise<JobApplication | null> {
    const index = this.jobs.findIndex(
      (j) => j._id === id && j.userId === userId,
    );
    if (index === -1) return null;
    const { resumeUrl, ...rest } = this.jobs[index];
    this.jobs[index] = { ...rest, updatedAt: new Date() };
    return this.jobs[index];
  }
}
