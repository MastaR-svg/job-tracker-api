import { Schema, model, Document, Types } from "mongoose";
import { JobStatus } from "../types";

export interface IJobDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  company: string;
  position: string;
  status: JobStatus;
  appliedDate: Date;
  salary?: number;
  location?: string;
  notes?: string;
  jobUrl?: string;
  interviewDate?: Date;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User",
      index: true, // we query by userId constantly — index it
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      maxlength: [100, "Position cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(JobStatus),
        message: `Status must be one of: ${Object.values(JobStatus).join(", ")}`,
      },
      default: JobStatus.Applied,
    },
    appliedDate: {
      type: Date,
      required: [true, "Applied date is required"],
      default: Date.now,
    },
    salary: { type: Number, min: [0, "Salary cannot be negative"] },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
    jobUrl: { type: String, trim: true },
    interviewDate: { type: Date },
    resumeUrl: { type: String, trim: true },
  },
  {
    timestamps: true, // auto-manages createdAt + updatedAt
    versionKey: false, // removes __v field from documents
  },
);

JobSchema.index({ userId: 1, status: 1 });
JobSchema.index({ userId: 1, createdAt: -1 });

JobSchema.index({ userId: 1, appliedDate: -1 });
JobSchema.index({ userId: 1, salary: -1 });
JobSchema.index({ userId: 1, company: 1 });

JobSchema.index(
  {
    company: "text",
    position: "text",
    location: "text",
    notes: "text",
  },
  {
    weights: {
      position: 10,
      company: 8,
      location: 3,
      notes: 1,
    },
    name: "job_text_search",
  },
);

export const JobModel = model<IJobDocument>("Job", JobSchema);
