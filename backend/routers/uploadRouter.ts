import { Router } from "express";
import { uploadAvatar, deleteAvatar } from "../controllers/uploadController";
import { upload } from "../middleswares/uploadMiddleware";
import { requireAuth } from "../middleswares/authMiddleware";

const router = Router();

/**
 * POST /upload/avatar
 * Upload ou met à jour l'avatar de l'utilisateur connecté
 * Nécessite authentification
 */
router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

/**
 * DELETE /upload/avatar
 * Supprime l'avatar de l'utilisateur connecté
 * Nécessite authentification
 */
router.delete("/avatar", requireAuth, deleteAvatar);

export default router;
