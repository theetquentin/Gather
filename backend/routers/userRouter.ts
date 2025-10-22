import { Router } from "express";
import {
  createUser,
  getUsers,
  findUserById,
  searchUsers,
} from "../controllers/userController";
import { requireAuth, requireRole } from "../middleswares/authMiddleware";

const userRouter = Router();

// Route de recherche doit être avant /:userId pour éviter les conflits
userRouter.get("/search", requireAuth, searchUsers);
userRouter.get("/:userId", requireAuth, findUserById);
userRouter.get("/", requireAuth, requireRole(["admin", "moderator"]), getUsers);
userRouter.post("/", createUser);

export default userRouter;
