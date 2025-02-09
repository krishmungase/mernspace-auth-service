import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest, UpdateUserRequest } from "../types";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class UserController {
  constructor(private readonly userService: UserService, private readonly logger: Logger) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, tenantId, role } = req.body;
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId
      });
      res.status(201).json({id: user.id});
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

  async destroy(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      await this.userService.deleteById(Number(userId));

      this.logger.info("User has been deleted", {
        id: Number(userId),
      });
      res.json({ id: Number(userId) });
    } catch (err) {
      next(err);
    }
  }

  async update(
    req: UpdateUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { firstName, lastName, role } = req.body;
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    this.logger.debug("Request for updating a user", req.body);

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      });

      this.logger.info("User has been updated", { id: userId });

      res.json({ id: Number(userId) });
    } catch (err) {
      next(err);
    }
  }
}
