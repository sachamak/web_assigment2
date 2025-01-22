/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import userModel from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

type Payload = {
  _id: string;
};

const register = async (req: Request, res: Response) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};
const generateToken = (
  _id: string
): { accessToken: string; refreshToken: string } | null => {
  if (!process.env.TOKEN_SECRET || !process.env.TOKEN_EXPIRATION) {
    return null;
  }
  const random = Math.floor(Math.random() * 1000000);
  const accessToken = jwt.sign(
    { _id: _id, random: random },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRATION }
  );
  const refreshToken = jwt.sign(
    { _id: _id, random: random },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );
  return { accessToken, refreshToken };
};
const login = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).send("User or password incorrect");
      return;
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      res.status(404).send("User or password incorrect");
      return;
    }
    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).send("server error");
      return;
    }

    if (user.refreshToken == null) {
      user.refreshToken = [];
    }
    user.refreshToken.push(tokens.refreshToken);
    await user.save();
    res
      .status(200)
      .send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        _id: user._id,
      });
  } catch (error) {
    res.status(400).send(error);
  }
};
const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.status(400).send("refreshToken is required");
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("server error");
    return;
  }

  jwt.verify(
    refreshToken,
    process.env.TOKEN_SECRET,
    async (err: any, payload: any) => {
      if (err) {
        res.status(401).send("Unauthorized");
        return;
      }
      const data = payload as Payload;
      try {
        const user = await userModel.findOne({ _id: data._id });
        if (!user) {
          res.status(404).send("User not found");
          return;
        }
        if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
          res.status(401).send("Unauthorized");
          user.refreshToken = [];
          await user.save();
          return;
        }
        user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
        await user.save();
        res.status(200).send("Logged out");
      } catch (err) {
        res.status(400).send(err);
      }
    }
  );
};
const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.status(400).send("refreshToken is required");
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("server error");
    return;
  }
  jwt.verify(
    refreshToken,
    process.env.TOKEN_SECRET,
    async (err: any, payload: any) => {
      if (err) {
        res.status(401).send("Unauthorized");
        return;
      }
      const data = payload as Payload;
      try {
        const user = await userModel.findOne({ _id: data._id });
        if (!user) {
          res.status(404).send("User not found");
          return;
        }
        if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
          res.status(402).send("Unauthorized");
          user.refreshToken = [];
          await user.save();
          return;
        }
        const tokens = generateToken(user._id);
        if (!tokens) {
          user.refreshToken = [];
          await user.save();
          res.status(500).send("server error");
          return;
        }
        user.refreshToken = user.refreshToken.filter((t) => t !== refreshToken);
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res
          .status(200)
          .send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
      } catch (err) {
        res.status(400).send(err);
      }
    }
  );
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.header("authorization");
  if (!authorization) {
    res.status(402).send("Unauthorized");
    return;
  }
  const token = authorization && authorization.split(" ")[1];
  if (!token) {
    res.status(403).send("Unauthorized");
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(500).send("server error");
    return;
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      res.status(401).send("Unauthorized");
      return;
    }
    req.params.userId = (payload as Payload)._id;
    next();
  });
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.find();
    res.status(200).send(users);
  } catch (err) {
    res.status(400).send(err);
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await userModel.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await userModel.findByIdAndDelete(userId);
    if (user) {
      res.status(200).send("User deleted");
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

export default {
  register,
  login,
  logout,
  refresh,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
};
