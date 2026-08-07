export enum JobStatus {
  Applied = "applied",
  Interview = "interview",
  Assessment = "assessment",
  Offer = "offer",
  Rejected = "rejected",
}

// Base Entity

export interface BaseEntity {
  readonly _id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// User Types

export interface User extends BaseEntity {
  email: string;
  username: string;
  passwordHash: string; // NEVER send this to the client
}

export type PublicUser = Omit<User, "passwordHash">;

export interface JobApplication extends BaseEntity {
  userId: string;
  company: string;
  position: string;
  status: JobStatus;
  appliedDate: Date;
  jobUrl?: string;
  salary?: number;
  location?: string;
  notes?: string;
  interviewDate?: Date;
  resumeUrl?: string;
}

export type CreateJobDto = Omit<
  JobApplication,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

export type UpdateJobDto = Partial<
  Omit<JobApplication, "_id" | "userId" | "createdAt" | "updatedAt">
>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Types

export type StatusCount = Record<JobStatus, number>;

export interface DashboardStats {
  totalApplications: number;
  statusBreakdown: StatusCount;
  recentApplications: JobApplication[];
  successRate: number; // percentage: offers / total * 100
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number; // issued at (set by JWT)
  exp?: number; // expiry (set by JWT)
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
  expiresIn: string;
}
