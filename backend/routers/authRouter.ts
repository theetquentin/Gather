import { Router } from "express";
import { login, me } from "../controllers/authController";
import { requireAuth } from "../middleswares/authMiddleware";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);

export default authRouter;
