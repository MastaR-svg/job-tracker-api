// User Repository

import { env } from "../config/env";
import { IUserDocument, UserModel } from "../models/user.model";
import { RegisterDto } from "../types";
import bcrypt from "bcrypt";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findById(id: string): Promise<IUserDocument | null>;
  create(data: RegisterDto): Promise<IUserDocument>;
  emailExists(email: string): Promise<boolean>;
}

export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    // passwordHash is excluded by default (select: false on schema)
    // We need it here to verify the password at login
    return UserModel.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash",
    );
  }

  async findById(id: string): Promise<IUserDocument | null> {
    // No +passwordHash here — we don't need it after initial auth
    return UserModel.findById(id);
  }

  async create(data: RegisterDto): Promise<IUserDocument> {
    const passwordHash = await bcrypt.hash(data.password, env.bcryptSaltRounds);

    const user = await UserModel.create({
      email: data.email.toLowerCase(),
      username: data.username,
      passwordHash,
    });
    return user;
  }

  async emailExists(email: string): Promise<boolean> {
      const count = await UserModel.countDocuments({
        email: email.toLowerCase(),
      })
      return count > 0;
  }
}
