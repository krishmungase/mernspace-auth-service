import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { TokenService } from "../services/TokenService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenservice: TokenService
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

      const accessToken = this.tokenservice.generateAccessToken(payload);

      // Persist the refresh token
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

      const newRefreshToken = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const refreshToken = this.tokenservice.generateRefreshToken({
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

      res.status(201).json({
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
