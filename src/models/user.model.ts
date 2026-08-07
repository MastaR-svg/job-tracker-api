// User Mongoose Model

import { Document, model, Schema, Types } from "mongoose";
// import { env } from "../config/env";
import bcrypt from "bcrypt";

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  // Instance method — available on every user document
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // creates a unique index — triggers 11000 error on duplicate
      lowercase: true, // always store as lowercase
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minLength: [2, "Username must be at least 2 characters"],
      maxLength: [30, "Username cannot exceed 30 characters"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // NEVER returned in queries by default
      // you must explicitly ask for it with .select("+passwordHash")
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Instance Method
// Calling user.comparePassword("plain") from anywhere in the app
// keeps password logic encapsulated in the model.

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Pre-save Hook (alternative approach — shown for awareness) ─
// Some codebases hash in a pre-save hook instead of the service.
// We'll hash in the service layer to keep it explicit and testable.
// Shown here so you know the pattern exists:
//
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("passwordHash")) return next();
//   this.passwordHash = await bcrypt.hash(this.passwordHash, env.bcryptSaltRounds);
//   next();
// });

export const UserModel = model<IUserDocument>("User", UserSchema);
