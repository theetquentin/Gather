import { Response } from "express";

export const handleServiceError = (
  err: unknown,
  res: Response,
  errorStatusMap?: Record<string, number>,
) => {
  if (err instanceof Error) {
    const status = errorStatusMap?.[err.message] || 400;

    return res.status(status).json({
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
