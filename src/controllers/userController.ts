import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import createHttpError from "http-errors";
import { Logger } from "winston";

export class UserController {
  constructor(private userService: UserService, private logger: Logger) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });
      res.status(201).json({});
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAll();
      this.logger.info("All users have been fetched");
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;
    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }
    try {
      const user = await this.userService.getById(Number(userId));
      this.logger.info("user has been fetched");
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}
