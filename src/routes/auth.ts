import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login-validator";
import { CredientialService } from "../services/CredientialService";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credientialService = new CredientialService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credientialService
);

router.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

router.get(
  "/self",
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.self(req as AuthRequest, res, next)
)

router.post(
  "/refresh",
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next)
)

router.post(
  "/logout",
  validateRefreshToken,
  parseRefreshToken,
  (req: Request,res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next)
)
export default router;
