import multer from "multer";
import { Request } from "express";

// Configuration multer pour stocker en mémoire (pas sur le disque)
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Format de fichier non supporté. Utilisez JPEG, PNG ou WebP."),
    );
  }
};

// Configuration multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
});
