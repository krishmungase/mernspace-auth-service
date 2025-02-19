import { Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role,tenantId }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (user) {
      const err = createHttpError(400, "Email is already exists!!");
      throw err;
    }

    // hashpassword
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenantId: tenantId ? {id: tenantId} : undefined
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in database");
      throw error;
    }
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "email", "firstName", "lastName", "role", "password"],
    });
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async getById(userId: number) {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }

  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database"
      );
      throw error;
    }
  }
}
