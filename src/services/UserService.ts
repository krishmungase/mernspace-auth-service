import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>){}
  async create({firstName,lastName,email,password} : UserData) {
    try {
      return await this.userRepository.save({ 
        firstName, 
        lastName, 
        email, 
        password,
        role: Roles.CUSTOMER,
      });
    } catch (err) {
      const error = createHttpError(500,"Failed to store data in database")
      throw error;
    }
  }
}