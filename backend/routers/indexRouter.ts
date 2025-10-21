import { Router } from "express";
import userRouter from "./userRouter";
import authRouter from "./authRouter";
import collectionRouter from "./collectionRouter";
import workRouter from "./workRouter";
import notificationRouter from "./notificationRouter";
import shareRouter from "./shareRouter";
const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/collections", collectionRouter);
router.use("/works", workRouter);
router.use("/notifications", notificationRouter);
router.use("/shares", shareRouter);

export default router;
