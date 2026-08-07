/// <reference types="jest" />
// Reusable mock repositories — implement the interface with jest.fn()

import { IJobRepository } from "../../repositories/job.repository";
import { IUserRepository } from "../../repositories/user.repository";

export function createMockRepository(): jest.Mocked<IJobRepository> {
  return {
    findById: jest.fn(),
    findByAllPaginated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStatusCounts: jest.fn(),
    getRecentJobs: jest.fn(),
    getTotalCount: jest.fn(),
    unsetResumeUrl: jest.fn(),
  };
}

export function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    emailExists: jest.fn(),
  };
}
