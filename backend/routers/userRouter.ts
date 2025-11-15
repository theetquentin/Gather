import { Router } from "express";
import {
  createUser,
  getUsers,
  findUserById,
  searchUsers,
  updateUser,
  updateUserRole,
} from "../controllers/userController";
import { requireAuth, requireRole } from "../middleswares/authMiddleware";

const userRouter = Router();

// Route de recherche doit être avant /:userId pour éviter les conflits
userRouter.get("/search", requireAuth, searchUsers);
userRouter.get("/:userId", requireAuth, findUserById);
userRouter.get("/", requireAuth, requireRole(["admin", "moderator"]), getUsers);
userRouter.post("/", createUser);
userRouter.patch("/:userId", requireAuth, updateUser);
userRouter.patch(
  "/:userId/role",
  requireAuth,
  requireRole(["admin"]),
  updateUserRole,
);

export default userRouter;
