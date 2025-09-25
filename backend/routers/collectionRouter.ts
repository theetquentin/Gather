import { Router } from "express";
import {
  createCollection,
  addWorks,
} from "../controllers/collectionController";
import { requireAuth } from "../middleswares/authMiddleware";

const collectionRouter = Router();

collectionRouter.post("/", requireAuth, createCollection);
collectionRouter.post("/:collectionId/works", requireAuth, addWorks);

export default collectionRouter;
