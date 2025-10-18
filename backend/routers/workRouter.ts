import { Router } from "express";
import { getAllWorks } from "../controllers/workController";

const router = Router();

router.get("/", getAllWorks);

export default router;
