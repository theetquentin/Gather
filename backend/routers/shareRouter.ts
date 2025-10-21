import { Router } from "express";
import {
  createShare,
  getMyShares,
  getCollectionShares,
  updateShareStatus,
  deleteShare,
} from "../controllers/shareController";
import { requireAuth } from "../middleswares/authMiddleware";

const shareRouter = Router();

// Toutes les routes nécessitent l'authentification
shareRouter.post("/", requireAuth, createShare);
shareRouter.get("/me", requireAuth, getMyShares);
shareRouter.get("/collection/:collectionId", requireAuth, getCollectionShares);
shareRouter.patch("/:shareId/status", requireAuth, updateShareStatus);
shareRouter.delete("/:shareId", requireAuth, deleteShare);

export default shareRouter;
