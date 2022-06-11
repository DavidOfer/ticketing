import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/UserModel";
import { Password } from "../utils/password";
import jwt from "jsonwebtoken";
import { BadRequestError,validateRequest } from "@odticketing/common";


const router = express.Router();

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password must not be empty"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("wrong credentials");
    }
    const isMatchPass = await Password.compare(user.password, password);

    if (!isMatchPass) {
      throw new BadRequestError("wrong credentials");
    }
    const token = jwt.sign({ id: user._id, email }, process.env.JWT_KEY!);
    req.session = {
      jwt: token,
    };
    res.status(200).send("logged in");
  }
);

export { router as signinRouter };
