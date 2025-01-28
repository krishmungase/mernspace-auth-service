import { NextFunction, Request, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import { CredientialService } from "../services/CredientialService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credientialService: CredientialService
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // Validation..
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const err = createHttpError(400, "Fileds are missing");
      next(err);
      return;
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
      password: "******",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("user has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1hr
        httpOnly: true, // very very Imp
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });

      this.logger.info("user is logged in successfully", { id: user.id });

      res.status(201).json({
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // Validation..
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const err = createHttpError(400, "Fileds are missing");
      next(err);
      return;
    }

    const { email, password } = req.body;

    this.logger.debug("New request to login a user", {
      email,
      password: "******",
    });

    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        const error = createHttpError(
          400,
          "Email or Password does not match!!"
        );
        next(error);
        return;
      }

      const passwordMatch = await this.credientialService.comparePassword(
        password,
        user.password
      );

      if (!passwordMatch) {
        const error = createHttpError(
          400,
          "Email or Password does not match!!"
        );
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1hr
        httpOnly: true, // very very Imp
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });

      res.json({
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    const user = await this.userService.findById(Number(req.auth?.sub));
    res.status(200).json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth?.sub,
        role: req.auth.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      
      const user = await this.userService.findById(Number(req.auth?.sub));

      if (!user) {
        const error = createHttpError(401, "Unauthorized token not found");
        next(error);
        return;
      }

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      await this.tokenService.deleteRefreshToken(Number(req.auth.id))

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1hr
        httpOnly: true, // very very Imp
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });

      this.logger.info("user is logged in successfully", { id: user.id });

      res.status(201).json({
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
  
}
