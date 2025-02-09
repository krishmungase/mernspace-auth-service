import bcrypt from "bcryptjs";

export class CredientialService {
  async comparePassword(userPassword: string, passwordHash: string) {
    return await bcrypt.compare(userPassword, passwordHash);
  }
}
