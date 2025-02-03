import express, { NextFunction, Request, Response } from "express";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { CreateUserRequest } from "../types";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService)

router.post(
  "/",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req as CreateUserRequest, res, next)
);

export default router;
