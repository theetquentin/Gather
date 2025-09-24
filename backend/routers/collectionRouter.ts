import { Router } from "express";
import { createCollection } from "../controllers/collectionController";
import { requireAuth } from "../middleswares/authMiddleware";

const collectionRouter = Router();

collectionRouter.post("/", requireAuth, createCollection);

export default collectionRouter;
