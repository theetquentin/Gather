import { Response } from "express";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import User from "../models/User";
import { Readable } from "stream";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";

/**
 * Upload ou met à jour l'avatar d'un utilisateur sur Cloudinary
 * Le public_id est basé sur l'ID MongoDB de l'utilisateur
 * Si une ancienne image existe, elle sera automatiquement remplacée
 */
export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        errors: "Utilisateur non authentifié",
        data: null,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        errors: "Aucun fichier fourni",
        data: null,
      });
      return;
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        errors: "Utilisateur non trouvé",
        data: null,
      });
      return;
    }

    // Générer le public_id basé sur l'ID utilisateur
    const publicId = `users/user_${userId}`;

    // Supprimer l'ancienne image si elle existe
    if (user.profilePicture) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (_error) {
        // Si l'image n'existe pas sur Cloudinary, on continue
        console.log("Ancienne image non trouvée sur Cloudinary, continuons...");
      }
    }

    // Convertir le buffer en stream pour Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "users",
        public_id: `user_${userId}`,
        overwrite: true,
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      async (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          console.error("Erreur Cloudinary:", error);
          res.status(500).json({
            success: false,
            errors: "Erreur lors de l'upload sur Cloudinary",
            data: null,
          });
          return;
        }

        if (!result) {
          res.status(500).json({
            success: false,
            errors: "Aucun résultat de Cloudinary",
            data: null,
          });
          return;
        }

        // Mettre à jour l'URL de l'avatar dans la base de données
        user.profilePicture = result.secure_url;
        await user.save();

        res.status(200).json({
          success: true,
          errors: null,
          data: {
            avatarUrl: result.secure_url,
            publicId: result.public_id,
          },
        });
      },
    );

    // Pipe le buffer vers le stream Cloudinary
    const bufferStream = Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    res.status(500).json({
      success: false,
      errors: "Erreur serveur lors de l'upload",
      data: null,
    });
  }
};

/**
 * Supprime l'avatar d'un utilisateur
 */
export const deleteAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        errors: "Utilisateur non authentifié",
        data: null,
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        errors: "Utilisateur non trouvé",
        data: null,
      });
      return;
    }

    if (!user.profilePicture) {
      res.status(400).json({
        success: false,
        errors: "Aucun avatar à supprimer",
        data: null,
      });
      return;
    }

    // Supprimer l'image sur Cloudinary
    const publicId = `users/user_${userId}`;
    await cloudinary.uploader.destroy(publicId);

    // Mettre à jour la base de données
    user.profilePicture = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      errors: null,
      data: { message: "Avatar supprimé avec succès" },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      success: false,
      errors: "Erreur serveur lors de la suppression",
      data: null,
    });
  }
};
