import { Request, Response } from "express";
import { getWorks } from "../services/workService";

export const getAllWorks = async (req: Request, res: Response) => {
  try {
    const { limit, type, search } = req.query;
    let limitValue: number | undefined;

    if (limit !== undefined) {
      const parsed = parseInt(limit as string, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({
          success: false,
          errors: "Le paramètre limit doit être un entier positif",
          data: null,
        });
      }
      limitValue = parsed;
    }

    const typeValue = type ? String(type) : undefined;
    const searchValue = search ? String(search) : undefined;

    const works = await getWorks(limitValue, typeValue, searchValue);

    return res.status(200).json({
      success: true,
      message: "Œuvres récupérées avec succès",
      data: {
        count: works.length,
        works,
      },
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    let status = 500;

    if (
      msg === "La limite doit être un entier positif" ||
      msg.startsWith("La limite ne peut pas dépasser")
    ) {
      status = 400;
    }

    return res.status(status).json({ success: false, errors: msg, data: null });
  }
};
