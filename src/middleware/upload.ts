import { Request } from "express";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { ValidationError } from "../utils/errors";

const ALLOWED_MIME_TYPES = [
  "application/pdf", // .pdf
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true); // accept the file
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  }
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // only one file per request
  },
}).single("resume"); // field name must be "resume" in the form

export function handleResumeUpload(req: Request, res: Response): Promise<void> {
  return new Promise((reslove, reject) => {
    uploadResume(req, res as any, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          reject(new ValidationError("File too large. Maximum size is 5MB"));
        } else {
          reject(new ValidationError(`Upload error: ${err.message}`));
        }
      } else if (err) {
        reject(new ValidationError(err.message));
      } else {
        reslove();
      }
    });
  });
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Failed to delete file: ${filePath}`);
  }
}
