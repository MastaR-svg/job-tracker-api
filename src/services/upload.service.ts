import path from "node:path";
import { deleteFile } from "../middleware/upload";
import { logger } from "../config/logger";

export class UploadService {
  getResumeUrl(filename: string): string {
    return `/uploads/resumes/${filename}`;
  }

  getFilePath(filename: string): string {
    return path.join(process.cwd(), "uploads", "resumes", filename);
  }

  getFilenameFromUrl(resumeUrl: string): string | null {
    const parts = resumeUrl.split("/");
    return parts[parts.length - 1] || null;
  }

  deleteResume(resumeUrl: string): void {
    const filename = this.getFilenameFromUrl(resumeUrl);
    if (filename) {
      const filePath = this.getFilePath(filename);
      deleteFile(filePath);
      logger.info(`Delete resume file: ${filename}`);
    }
  }
}

export const uploadService = new UploadService();
