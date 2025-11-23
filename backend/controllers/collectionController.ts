import { Response } from "express";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { CreateCollectionDto } from "../dtos/createCollection.dto";
import { ICollection } from "../interfaces/interface.icollection";
import {
  createNewCollection,
  addWorksToCollection,
  fetchCollections,
  fetchCollectionsByUser,
  fetchCollectionById,
  updateCollectionById,
  deleteCollectionById,
} from "../services/collectionService";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";
import { handleServiceError } from "../utils/errorHandler";

const collectionErrorMap: Record<string, number> = {
  "Identifiant de collection invalide": 400,
  "Identifiant utilisateur invalide": 400,
  "Liste d'œuvres vide ou invalide": 400,
  "Vous avez déjà nommé une de vos collections ainsi": 400,
  "Vous avez déjà une collection avec ce nom": 400,
  "Certaines œuvres n'existent pas": 400,
  "Cette œuvre est déjà présente dans cette collection": 400,
  "Certaines œuvres sont déjà présentes dans cette collection": 400,
  "La limite doit être un entier positif": 400,
  "Collection non trouvée": 404,
  "Utilisateur non trouvé": 404,
  "Accès refusé à cette collection": 403,
};

export const createCollection = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const dto = plainToInstance(CreateCollectionDto, {
      ...req.body,
      authorId: req.user.id,
    });
    const errors = await validate(dto);

    if (errors.length > 0) {
      const firstError = errors[0];
      const firstMessage = firstError.constraints
        ? Object.values(firstError.constraints)[0]
        : "Données invalides";
      return res
        .status(400)
        .json({ success: false, errors: firstMessage, data: null });
    }

    const collectionObject = instanceToPlain(dto) as unknown as ICollection;
    const result = await createNewCollection(collectionObject);

    return res.status(201).json({
      success: true,
      message: "Collection créée avec succès",
      data: {
        _id: result._id,
        name: result.name,
        type: result.type,
        visibility: result.visibility,
        authorId: result.authorId,
        works: result.works,
      },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, collectionErrorMap);
  }
};

export const addWorks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { collectionId } = req.params as { collectionId: string };
    const { workIds } = req.body as { workIds?: string[] };

    if (!Array.isArray(workIds) || workIds.length === 0) {
      return res.status(400).json({
        success: false,
        errors: "workIds doit être un tableau non vide",
        data: null,
      });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const result = await addWorksToCollection(
      collectionId,
      workIds,
      req.user.id,
    );

    const totalIssues =
      result.invalidIds.length +
      result.nonexistentIds.length +
      result.mismatchedIds.length;

    const status =
      result.addedCount === 0 && totalIssues > 0
        ? 422
        : result.addedCount > 0 && totalIssues > 0
          ? 207
          : 200;

    const message =
      status === 200
        ? "Toutes les œuvres ont été ajoutées"
        : status === 207
          ? "Ajout partiel effectué"
          : "Aucune œuvre ajoutée en raison de problèmes de validation";

    return res.status(status).json({
      success: true,
      message,
      data: {
        requestedCount: workIds.length,
        addedCount: result.addedCount,
        invalidIds: result.invalidIds,
        nonexistentIds: result.nonexistentIds,
        mismatchedIds: result.mismatchedIds,
        collection: {
          _id: result.updatedCollection._id,
          name: result.updatedCollection.name,
          type: result.updatedCollection.type,
          visibility: result.updatedCollection.visibility,
          authorId: result.updatedCollection.authorId,
          works: result.updatedCollection.works,
        },
      },
    });
  } catch (err: unknown) {
    // Cas spécial pour les types incompatibles
    if (
      err instanceof Error &&
      err.message.startsWith(
        "Les oeuvres ne sont pas du même type que la collection:",
      )
    ) {
      const ids = err.message.split(":")[1] ?? "";
      return res.status(422).json({
        success: false,
        errors: "Le type des œuvres doit correspondre au type de la collection",
        data: { mismatchedIds: ids ? ids.split(",") : [] },
      });
    }
    return handleServiceError(err, res, collectionErrorMap);
  }
};

export const getAllCollections = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    // Par défaut, on affiche uniquement les collections publiques
    let publicOnly = true;

    // Si le paramètre publicOnly est explicitement à false
    if (req.query.publicOnly === "false") {
      // Vérifier que l'utilisateur est authentifié et a le rôle approprié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          errors: "Authentification requise pour voir toutes les collections",
          data: null,
        });
      }

      if (!["admin", "moderator"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          errors: "Accès refusé : réservé aux modérateurs et administrateurs",
          data: null,
        });
      }

      publicOnly = false;
    }

    const { limit, page, type, search } = req.query;

    const result = await fetchCollections(
      publicOnly,
      limit ? parseInt(limit as string, 10) : 20,
      page ? parseInt(page as string, 10) : 1,
      type as string | undefined,
      search as string | undefined,
    );

    return res.status(200).json({
      success: true,
      message: publicOnly
        ? "Liste des collections publiques"
        : "Liste de toutes les collections",
      data: result,
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, collectionErrorMap);
  }
};

export const getUserCollections = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { limit, page, type, search, visibility } = req.query;

    const result = await fetchCollectionsByUser(
      req.user.id,
      limit ? parseInt(limit as string, 10) : 20,
      page ? parseInt(page as string, 10) : 1,
      type as string | undefined,
      search as string | undefined,
      visibility as
        | "owned"
        | "private"
        | "public"
        | "shared"
        | "shared-with-me"
        | undefined,
    );

    return res.status(200).json({
      success: true,
      message: "Vos collections",
      data: result,
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, collectionErrorMap);
  }
};

export const getCollectionById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user?.id;

    const collection = await fetchCollectionById(collectionId, userId);

    return res.status(200).json({
      success: true,
      message: "Détails de la collection",
      data: { collection },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, collectionErrorMap);
  }
};

export const updateCollection = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { collectionId } = req.params;
    const updates = req.body;

    const allowedFields = ["name", "type", "visibility", "works"];
    const hasInvalidFields = Object.keys(updates).some(
      (key) => !allowedFields.includes(key),
    );

    if (hasInvalidFields) {
      return res.status(400).json({
        success: false,
        errors: "Champs non modifiables détectés",
        data: null,
      });
    }

    const updated = await updateCollectionById(
      collectionId,
      req.user.id,
      updates,
    );

    return res.status(200).json({
      success: true,
      message: "Collection mise à jour",
      data: {
        collection: {
          _id: updated._id,
          name: updated.name,
          type: updated.type,
          visibility: updated.visibility,
          authorId: updated.authorId,
          works: updated.works,
        },
      },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, collectionErrorMap);
  }
};

export const deleteCollection = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { collectionId } = req.params;
    await deleteCollectionById(collectionId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Collection supprimée",
      data: null,
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, collectionErrorMap);
  }
};
