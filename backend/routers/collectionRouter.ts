import { Router } from "express";
import {
  createCollection,
  addWorks,
  getAllCollections,
  getUserCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from "../controllers/collectionController";
import { requireAuth, optionalAuth } from "../middleswares/authMiddleware";

const collectionRouter = Router();

// Routes publiques
collectionRouter.get("/", optionalAuth, getAllCollections); // GET /collections - public par défaut, toutes si admin/moderator

// Routes protégées
collectionRouter.post("/", requireAuth, createCollection);
collectionRouter.get("/me", requireAuth, getUserCollections);
collectionRouter.get("/:collectionId", optionalAuth, getCollectionById);
collectionRouter.patch("/:collectionId", requireAuth, updateCollection);
collectionRouter.delete("/:collectionId", requireAuth, deleteCollection);
collectionRouter.post("/:collectionId/works", requireAuth, addWorks);

export default collectionRouter;
