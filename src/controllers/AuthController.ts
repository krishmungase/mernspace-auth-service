import { NextFunction, Response } from "express"
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class AuthController {
  
  constructor(private userService: UserService, private logger:Logger){}

  async register(req: RegisterUserRequest,res: Response,next: NextFunction){
    
    // Validation..
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const err = createHttpError(400,"Fileds are missing");
      next(err);
      return;
    }



    const {firstName,lastName,email,password} = req.body;

    this.logger.debug("New request to register a user", {
      firstName, 
      lastName, 
      email,
      password:"******"
    })

    try {
      const user = await this.userService.create({
        firstName, 
        lastName, 
        email, 
        password
      });

      this.logger.info("user has been registered",{id:user.id})

      res.status(201).json({
        status: true,
        message: "user Register!!!",
        id: user.id
      });

    } catch (err) {
      next(err);
      return;
    }    
  }
}