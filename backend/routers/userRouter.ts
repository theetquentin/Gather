import { Router } from "express";
import {
  createUser,
  getUsers,
  findUserById,
} from "../controllers/userController";

const userRouter = Router();

userRouter.get("/:userId", findUserById);
userRouter.get("/", getUsers);
userRouter.post("/", createUser);


export default userRouter;
