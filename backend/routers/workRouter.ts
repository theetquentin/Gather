import { Router } from "express";
import { getAllWorks, getWorkById } from "../controllers/workController";

const router = Router();

router.get("/", getAllWorks);
router.get("/:id", getWorkById);

export default router;
