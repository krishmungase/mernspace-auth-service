import { body } from "express-validator";

export default [
  body("email").notEmpty().withMessage("Email is required").trim().isEmail(),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  body("password").notEmpty().isLength({ min: 6 }),
]