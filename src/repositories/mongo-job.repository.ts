// MongoJobRepository
// Implements the SAME IJobRepository interface as InMemoryJobRepository.
// The Service and Controller don't know or care which one is active.

import { Types } from "mongoose";
import { IJobRepository, QueryOptions, SortField } from "./job.repository";
import { JobModel, IJobDocument } from "../models/job.model";
import {
  JobApplication,
  CreateJobDto,
  UpdateJobDto,
  JobStatus,
} from "../types";

export class MongoJobRepository implements IJobRepository {
  private toJobApplication(doc: IJobDocument): JobApplication {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      company: doc.company,
      position: doc.position,
      status: doc.status,
      appliedDate: doc.appliedDate,
      salary: doc.salary,
      location: doc.location,
      notes: doc.notes,
      jobUrl: doc.jobUrl,
      resumeUrl: doc.resumeUrl,
      interviewDate: doc.interviewDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  // Build MongoDB filter query

  private buildQuery(
    userId: string,
    options: Partial<QueryOptions>,
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    // Status filter
    if (
      options.status &&
      Object.values(JobStatus).includes(options.status as JobStatus)
    ) {
      query.status = options.status;
    }
    // Search - use $text for longer queries, $or/$regex for short ones
    if (options.search?.trim()) {
      const term = options.search.trim();

      if (term.length >= 3) {
        // Full-text search — uses the text index, searches all indexed fields
        query.$text = { $search: term };
      } else {
        // Short term — $text won't work well, fall back to $regex on company only
        query.company = { $regex: term, $options: "i" };
      }
    }

    // Data range filter
    if (options.dateForm || options.dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (options.dateForm) dateFilter.$gte = new Date(options.dateForm);
      if (options.dateTo) dateFilter.$lte = new Date(options.dateTo);
      query.appliedDate = dateFilter;
    }

    return query;
  }

  // Build MongoDB sort object

  private buildSort(
    options: Partial<QueryOptions>,
    hasTextSearch: boolean,
  ): Record<string, unknown> {
    // If text search is active, sort by relevance score first
    if (hasTextSearch && options.search && options.search.trim().length >= 3) {
      return { score: { $meta: "textScore" }, createdAt: -1 };
    }

    const order = options.sortOrder === "asc" ? 1 : -1;

    const sortMap: Record<SortField, Record<string, number>> = {
      createdAt: { craetedAt: order },
      appliedDate: { appliedDate: order },
      company: { company: order },
      salary: { salary: order },
    };

    return sortMap[options.sortBy as SortField] ?? { createdAt: -1 };
  }

  // Interface Implementation

  async findByAllPaginated(
    userId: string,
    options: QueryOptions,
  ): Promise<{ jobs: JobApplication[]; total: number }> {
    const query = this.buildQuery(userId, options);
    const skip = (options.page - 1) * options.limit;
    const hasTextSearch = Boolean(query.$text);

    // When using text search, project the score so we can sort by it
    const projection = hasTextSearch ? { score: { $meta: "textScore" } } : {};

    const sort = this.buildSort(options, hasTextSearch);

    // Run both queries in parallel — same filter, same point in time
    const [docs, total] = await Promise.all([
      JobModel.find(query)
        .find(query, projection)
        .sort(sort as any)
        .skip(skip)
        .limit(options.limit),
      JobModel.countDocuments(query),
    ]);

    return {
      jobs: docs.map((doc) => this.toJobApplication(doc)),
      total,
    };
  }

  async findById(id: string, userId: string): Promise<JobApplication | null> {
    if (!this.isValidObjectId(id)) return null; // invalid format → treat as not found

    const doc = await JobModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    return doc ? this.toJobApplication(doc) : null;
  }

  async create(userId: string, data: CreateJobDto): Promise<JobApplication> {
    const doc = await JobModel.create({
      ...data,
      userId: new Types.ObjectId(userId),
    });

    return this.toJobApplication(doc);
  }

  async update(
    id: string,
    userId: string,
    data: UpdateJobDto,
  ): Promise<JobApplication | null> {
    if (!this.isValidObjectId(id)) return null;

    const doc = await JobModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      },
      { $set: data },
      { new: true, runValidators: true }, // new: return updated doc; runValidators: re-run schema validation
    );

    return doc ? this.toJobApplication(doc) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!this.isValidObjectId(id)) return false;

    const result = await JobModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    return result.deletedCount === 1;
  }

  async getStatusCounts(userId: string): Promise<Record<JobStatus, number>> {
    const counts: Record<JobStatus, number> = {
      [JobStatus.Applied]: 0,
      [JobStatus.Interview]: 0,
      [JobStatus.Assessment]: 0,
      [JobStatus.Offer]: 0,
      [JobStatus.Rejected]: 0,
    };

    const results = await JobModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    for (const result of results) {
      if (result._id in counts) {
        counts[result._id as JobStatus] = result.count;
      }
    }
    return counts;
  }

  async getRecentJobs(
    userId: string,
    limit: number,
  ): Promise<JobApplication[]> {
    const docs = await JobModel.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.toJobApplication(doc));
  }

  async getTotalCount(userId: string): Promise<number> {
    return JobModel.countDocuments({ userId: new Types.ObjectId(userId) });
  }

  async unsetResumeUrl(
    id: string,
    userId: string,
  ): Promise<JobApplication | null> {
    if (!this.isValidObjectId(id)) return null;

    const doc = await JobModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $unset: { resumeUrl: "" } },
      { new: true },
    );

    return doc ? this.toJobApplication(doc) : null;
  }
}
