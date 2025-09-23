import { Router } from "express";
import {
  createUser,
  getUsers,
  findUserById,
} from "../controllers/userController";
import { requireAuth, requireRole } from "../middleswares/authMiddleware";

const userRouter = Router();

userRouter.get("/:userId", requireAuth, findUserById);
userRouter.get("/", requireAuth, requireRole(["admin", "moderator"]), getUsers);
userRouter.post("/", createUser);

export default userRouter;
