import { Response } from "express";

export const handleServiceError = (
  err: unknown,
  res: Response,
  errorStatusMap?: Record<string, number>,
) => {
  if (err instanceof Error) {
    let status = errorStatusMap?.[err.message];

    // Si pas de correspondance exacte, vérifier les patterns
    if (!status) {
      if (err.message.startsWith("La limite ne peut pas dépasser")) {
        status = 400;
      }
    }

    const finalStatus = status || 400;

    return res.status(finalStatus).json({
      success: false,
      errors: err.message,
      data: null,
    });
  }

  return res.status(500).json({
    success: false,
    errors: "Une erreur serveur est survenue",
    data: null,
  });
};
