import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";

export class UserController {
  constructor(private userService: UserService) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER
      });
      res.status(201).json({});
    } catch (error) {
      next(error)
    }
  }
}
