// Shared test fixtures — reused across all test files

import {
  AuthResponse,
  JobApplication,
  JobStatus,
  PublicUser,
} from "../../types";

export const mockUserId = "6a4108fb0ddd868702bac645";
export const mockJobId = "6a4111b37afc9749bfaf34d8";

export const mockJob: JobApplication = {
  _id: mockJobId,
  userId: mockUserId,
  company: "Google",
  position: "Backend Engineer",
  status: JobStatus.Applied,
  appliedDate: new Date("2026-06-01"),
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

export const mockJobInterview: JobApplication = {
  ...mockJob,
  _id: "6a4111b37afc9749bfaf34d9",
  company: "Stripe",
  status: JobStatus.Interview,
};

export const mockUser: PublicUser = {
  _id: mockUserId,
  email: "test@example.com",
  username: "testuser",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
  passwordHash: "",
};

export const mockAuthResponse: AuthResponse = {
  user: mockUser,
  token: "mock.jwt.token",
  expiresIn: "7d",
};

export const mockStatusCounts = {
  [JobStatus.Applied]: 2,
  [JobStatus.Interview]: 1,
  [JobStatus.Assessment]: 0,
  [JobStatus.Offer]: 0,
  [JobStatus.Rejected]: 0,
};
