import { IUser } from "../interfaces/interface.iuser";
import {
  createNewUser,
  fetchUsers,
  fetchUserById,
} from "../services/userService";
import { Request, Response } from "express";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password }: IUser = req.body;
    const newUser = await createNewUser({ username, email, password });
    res.status(201).json({
      success: true,
      message: "User created with success",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await fetchUsers();
    res.status(200).json({
      success: true,
      message: "List of all users",
      data: { users },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
};

export const findUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await fetchUserById(userId);
    res.status(200).json({
      success: true,
      message: `Here's the user for the id ${userId}`,
      data: { user },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res
        .status(400)
        .json({ success: false, message: "Invalid userId", data: null });
    }
  }
};
