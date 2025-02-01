import { NextFunction, Request, Response } from "express"
import { AuthRequest } from "../types";
import createHttpError from "http-errors";

export const canAccess = (roles:string[]) => {
  return (req: Request,res: Response,next: NextFunction) => {
    const _req = req as AuthRequest;
    const roleFromToken = _req.auth.role;

    console.log("roleFromToken",roleFromToken);

    if(!roles.includes(roleFromToken)){
      const error = createHttpError(403,"You do not have permission to access")
      next(error);
      return;
    }

    next();
  }
}