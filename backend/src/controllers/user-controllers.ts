import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager";
import { COOKIE_NAME } from "../utils/constants";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();

    return res.status(200).json({ message: "OK", users });
  } catch (err: any) {
    console.log(err);
    return res.json({ message: "ERROR", cause: err.message });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(401).json({ message: "User Already Registered" });

    const hashedPassword = await hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true
    });

    const token = createToken(user._id.toString(), user.email, "7d");

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
      expires
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (err: any) {
    console.log(err);
    return res.json({ message: "ERROR", cause: err.message });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("User not registered");
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).send("Incorrect password");
    }

    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true
    });

    const token = createToken(user._id.toString(), user.email, "7d");

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
      expires
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (err: any) {
    console.log(err);
    return res.json({ message: "ERROR", cause: err.message });
  }
};

export const userVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).send("User not registered or Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permission denied");
    }

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (err: any) {
    console.log(err);
    return res.json({ message: "ERROR", cause: err.message });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res.status(401).send("User not registered or Token malfunctioned");
    }

    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permission denied");
    }

    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true
    });

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (err: any) {
    console.log(err);
    return res.json({ message: "ERROR", cause: err.message });
  }
};
