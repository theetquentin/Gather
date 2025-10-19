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
import { requireAuth } from "../middleswares/authMiddleware";

const collectionRouter = Router();

// Routes publiques
collectionRouter.get("/", getAllCollections); // GET /collections?visibility=public

// Routes protégées
collectionRouter.post("/", requireAuth, createCollection);
collectionRouter.get("/me", requireAuth, getUserCollections);
collectionRouter.get("/:collectionId", getCollectionById);
collectionRouter.patch("/:collectionId", requireAuth, updateCollection);
collectionRouter.delete("/:collectionId", requireAuth, deleteCollection);
collectionRouter.post("/:collectionId/works", requireAuth, addWorks);

export default collectionRouter;
