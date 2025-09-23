import { Router } from "express";
import userRouter from "./userRouter";
import authRouter from "./authRouter";
const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);

export default router;
