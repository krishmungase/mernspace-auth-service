import "reflect-metadata"
import express, { NextFunction, Request, Response } from "express"
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth"

const app = express();

app.get('/', async (req,res) => {
  res.send("Welcome to this course");
})

app.use("/auth",authRouter);

// global error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: ''
      }
    ]
  })
})

export default app