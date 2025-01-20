import bcrypt from "bcrypt";

export class CredientialService {
  async comparePassword(userPassword: string, passwordHash: string) {
    return await bcrypt.compare(userPassword, passwordHash);
  }
}
