import { Router } from "express";
import userRouter from "./userRouter";
import authRouter from "./authRouter";
import collectionRouter from "./collectionRouter";
import workRouter from "./workRouter";
const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/collections", collectionRouter);
router.use("/works", workRouter);

export default router;
