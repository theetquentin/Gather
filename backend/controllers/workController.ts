import { Request, Response } from "express";
import { getWorks, getWork } from "../services/workService";

export const getAllWorks = async (req: Request, res: Response) => {
  try {
    const { limit, page, type, search, genre, year } = req.query;
    let limitValue: number | undefined;
    let pageValue: number | undefined;

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

    if (page !== undefined) {
      const parsed = parseInt(page as string, 10);
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          success: false,
          errors: "Le paramètre page doit être un entier positif supérieur à 0",
          data: null,
        });
      }
      pageValue = parsed;
    }

    const typeValue = type ? String(type) : undefined;
    const searchValue = search ? String(search) : undefined;

    // Genre peut être un tableau (sélection multiple)
    let genreValue: string[] | undefined;
    if (genre) {
      genreValue = Array.isArray(genre)
        ? genre.map((g) => String(g))
        : [String(genre)];
    }

    // Year est une sélection unique (peut être une année ou "before-1900")
    const yearValue = year ? String(year) : undefined;

    const result = await getWorks(
      limitValue,
      pageValue,
      typeValue,
      searchValue,
      genreValue,
      yearValue,
    );

    return res.status(200).json({
      success: true,
      message: "Œuvres récupérées avec succès",
      data: result,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    let status = 500;

    if (
      msg === "La limite doit être un entier positif" ||
      msg.startsWith("La limite ne peut pas dépasser") ||
      msg === "La page doit être un entier positif"
    ) {
      status = 400;
    }

    return res.status(status).json({ success: false, errors: msg, data: null });
  }
};

export const getWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        errors: "L'ID de l'œuvre est requis",
        data: null,
      });
    }

    const work = await getWork(id);

    return res.status(200).json({
      success: true,
      message: "Œuvre récupérée avec succès",
      data: work,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    let status = 500;

    if (msg === "ID invalide") {
      status = 400;
    } else if (msg === "Œuvre introuvable") {
      status = 404;
    }

    return res.status(status).json({ success: false, errors: msg, data: null });
  }
};
