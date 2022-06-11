import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/UserModel";
import { BadRequestError,validateRequest } from "@odticketing/common";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      throw new BadRequestError("Email is already in use");
    }
    const user = User.build({ email, password });

    const { _id } = await user.save();

    const token = jwt.sign({ id: _id, email }, process.env.JWT_KEY!);

    req.session = {
      jwt: token,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
