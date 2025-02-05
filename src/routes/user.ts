import express, { NextFunction, Request, Response } from "express";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { CreateUserRequest } from "../types";
import logger from "../config/logger";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService,logger)

router.post(
  "/",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req as CreateUserRequest, res, next)
);

router.get(
  "/",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req:Request,res:Response,next:NextFunction) => 
    userController.getAll(req,res,next)
)

router.get(
  "/:id",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req:Request,res:Response,next:NextFunction) => 
    userController.getOne(req,res,next)
)

router.delete(
  "/:id",
  validateRefreshToken,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.destroy(req, res, next),
);
export default router;
