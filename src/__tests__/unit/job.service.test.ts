import { JobService } from "../../services/job.service";
import { JobStatus } from "../../types";
import { NotFoundError } from "../../utils/errors";
import {
  mockJob,
  mockJobId,
  mockJobInterview,
  mockStatusCounts,
  mockUserId,
} from "../helpers/mockData";
import { createMockRepository } from "../helpers/mockRepository";

describe("JobService", () => {
  let jobService: JobService;
  let mockRepo: ReturnType<typeof createMockRepository>;

  // Runs before each test — fresh mock, fresh service
  beforeEach(() => {
    mockRepo = createMockRepository();
    jobService = new JobService(mockRepo);
  });

  // getJobById

  describe("getJobById", () => {
    it("returns the job when found", async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(mockJob);

      // Act
      const result = await jobService.getJobById(mockJobId, mockUserId);

      // Assert
      expect(result).toEqual(mockJob);
      expect(mockRepo.findById).toHaveBeenCalledWith(mockJobId, mockUserId);
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("throws NotFoundError when job does not exist", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        jobService.getJobById(mockJobId, mockUserId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // getAllJobs

  describe("getAllJobs", () => {
    it("returns paginated jobs with correct metadata", async () => {
      mockRepo.findByAllPaginated.mockResolvedValue({
        jobs: [mockJob, mockJobInterview],
        total: 2,
      });

      const result = await jobService.getAllJobs(mockUserId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.success).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it("calculates totalPages correctly", async () => {
      mockRepo.findByAllPaginated.mockResolvedValue({
        jobs: [mockJob, mockJobInterview],
        total: 25,
      });

      const result = await jobService.getAllJobs(mockUserId, {
        page: 1,
        limit: 10,
      });

      expect(result.totalPages).toBe(3); // ceil(25/10) = 3
    });

    it("clamps page to minimum of 1", async () => {
      mockRepo.findByAllPaginated.mockResolvedValue({ jobs: [], total: 0 });

      const result = await jobService.getAllJobs(mockUserId, {
        page: -5,
        limit: 10,
      });

      expect(result.page).toBe(1);
    });

    it("clamps limit to maximum of 50", async () => {
      mockRepo.findByAllPaginated.mockResolvedValue({ jobs: [], total: 0 });

      const result = await jobService.getAllJobs(mockUserId, {
        page: 1,
        limit: 999,
      });

      expect(result.limit).toBe(50);
    });
  });

  // createJob

  describe("createJob", () => {
    const validJobData = {
      company: "Google",
      position: "Backend Engineer",
      status: JobStatus.Applied,
      appliedDate: new Date("2026-06-01"),
    };

    it("creates and returns a job", async () => {
      mockRepo.create.mockResolvedValue(mockJob);

      const result = await jobService.createJob(mockUserId, validJobData);

      expect(result).toEqual(mockJob);
      expect(mockRepo.create).toHaveBeenCalledWith(mockUserId, validJobData);
    });

    it("calls repository with correct userId", async () => {
      mockRepo.create.mockResolvedValue(mockJob);

      await jobService.createJob(mockUserId, validJobData);

      expect(mockRepo.create).toHaveBeenCalledWith(
        mockUserId,
        expect.any(Object),
      );
    });
  });

  // updateJob

  describe("updateJob", () => {
    it("returns updated job on success", async () => {
      const updatedJob = { ...mockJob, status: JobStatus.Interview };
      mockRepo.update.mockResolvedValue(updatedJob);

      const result = await jobService.updateJob(mockJobId, mockUserId, {
        status: JobStatus.Interview,
      });

      expect(result.status).toBe(JobStatus.Interview);
    });

    it("throws NotFoundError when job does not exist", async () => {
      mockRepo.update.mockResolvedValue(null);

      await expect(
        jobService.updateJob(mockJobId, mockUserId, {
          status: JobStatus.Interview,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // deleteJob

  describe("deleteJob", () => {
    it("resolves without error when deletion succeeds", async () => {
      mockRepo.delete.mockResolvedValue(true);

      await expect(
        jobService.deleteJob(mockJobId, mockUserId),
      ).resolves.toBeUndefined();
    });

    it("throws NotFoundError when job does not exist", async () => {
      mockRepo.delete.mockResolvedValue(false);

      await expect(jobService.deleteJob(mockJobId, mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  // getDashboard

  describe("getDashboard", () => {
    it("returns complete dashboard with all fields", async () => {
      mockRepo.getStatusCounts.mockResolvedValue(mockStatusCounts);
      mockRepo.getRecentJobs.mockResolvedValue([mockJob]);
      mockRepo.getTotalCount.mockResolvedValue(3);

      const result = await jobService.getDashboard(mockUserId);

      expect(result.totalApplications).toBe(3);
      expect(result.statusBreakdown).toEqual(mockStatusCounts);
      expect(result.recentApplications).toHaveLength(1);
      expect(result.successRate).toBe(0); // 0 offers out of 3 total applications
    });

    it("calculates successRate correctly when offers exist", async () => {
      mockRepo.getStatusCounts.mockResolvedValue({
        ...mockStatusCounts,
        [JobStatus.Offer]: 1,
      });
      mockRepo.getRecentJobs.mockResolvedValue([mockJob]);
      mockRepo.getTotalCount.mockResolvedValue(10);

      const result = await jobService.getDashboard(mockUserId);

      expect(result.successRate).toBe(10); // 1 offer / 10 total = 10%
    });

    it("returns successRate of 0 when no applications exist", async () => {
      mockRepo.getStatusCounts.mockResolvedValue({
        [JobStatus.Applied]: 0,
        [JobStatus.Interview]: 0,
        [JobStatus.Assessment]: 0,
        [JobStatus.Offer]: 0,
        [JobStatus.Rejected]: 0,
      });
      mockRepo.getRecentJobs.mockResolvedValue([]);
      mockRepo.getTotalCount.mockResolvedValue(0);

      const result = await jobService.getDashboard(mockUserId);

      // Avoids division by zero
      expect(result.successRate).toBe(0);
    });

    it("runs all three queries in parallel", async () => {
      mockRepo.getStatusCounts.mockResolvedValue(mockStatusCounts);
      mockRepo.getRecentJobs.mockResolvedValue([]);
      mockRepo.getTotalCount.mockResolvedValue(0);

      await jobService.getDashboard(mockUserId);

      // All three should have been called exactly once
      expect(mockRepo.getStatusCounts).toHaveBeenCalledTimes(1);
      expect(mockRepo.getRecentJobs).toHaveBeenCalledTimes(1);
      expect(mockRepo.getTotalCount).toHaveBeenCalledTimes(1);
    });
  });
});
