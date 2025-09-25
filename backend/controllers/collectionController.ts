import { Request, Response } from "express";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { CreateCollectionDto } from "../dtos/createCollection.dto";
import { ICollection } from "../interfaces/interface.icollection";
import {
  createNewCollection,
  addWorksToCollection,
} from "../services/collectionService";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(CreateCollectionDto, req.body);
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
        id: result._id,
        name: result.name,
        type: result.type,
        visibility: result.visibility,
        userId: result.userId,
        works: result.works,
      },
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    let status = 500;
    if (
      msg === "Vous avez déjà nommé une de vos collections ainsi" ||
      msg === "Certaines œuvres n'existent pas"
    ) {
      status = 400;
    } else if (msg === "Utilisateur non trouvé") {
      status = 404;
    } else if (
      msg.startsWith("Les oeuvres ne sont pas du même type que la collection:")
    ) {
      status = 422;
      const ids = msg.split(":")[1] ?? "";
      return res.status(status).json({
        success: false,
        errors: "Le type des œuvres doit correspondre au type de la collection",
        data: { mismatchedIds: ids ? ids.split(",") : [] },
      });
    }
    return res.status(status).json({ success: false, errors: msg, data: null });
  }
};

// single-item addWork removed in favor of bulk endpoint

export const addWorks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { collectionId } = req.params as { collectionId: string };
    const { workIds } = req.body as { workIds?: string[] };
    if (!Array.isArray(workIds) || workIds.length === 0)
      return res.status(400).json({
        success: false,
        errors: "workIds doit être un tableau non vide",
        data: null,
      });

    if (!req.user)
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });

    const result = await addWorksToCollection(
      collectionId,
      workIds,
      req.user.id,
    );

    const totalRequested = workIds.length;
    const issuesCount =
      result.invalidIds.length +
      result.nonexistentIds.length +
      result.mismatchedIds.length;

    let status = 200;
    if (result.addedCount === 0 && issuesCount > 0)
      status = 422; // Unprocessable
    else if (result.addedCount > 0 && issuesCount > 0)
      status = 207; // Multi-Status
    else status = 200; // All good

    return res.status(status).json({
      success: true,
      message:
        status === 200
          ? "Toutes les œuvres ont été ajoutées"
          : status === 207
            ? "Ajout partiel effectué"
            : "Aucune œuvre ajoutée en raison de problèmes de validation",
      data: {
        requestedCount: totalRequested,
        addedCount: result.addedCount,
        invalidIds: result.invalidIds,
        nonexistentIds: result.nonexistentIds,
        mismatchedIds: result.mismatchedIds,
        collection: {
          id: result.updatedCollection._id,
          name: result.updatedCollection.name,
          type: result.updatedCollection.type,
          visibility: result.updatedCollection.visibility,
          userId: result.updatedCollection.userId,
          works: result.updatedCollection.works,
        },
      },
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    let status = 500;
    if (
      msg === "Identifiant de collection invalide" ||
      msg === "Liste d'œuvres vide ou invalide"
    ) {
      status = 400;
    } else if (msg === "Collection non trouvée") {
      status = 404;
    } else if (msg === "Accès refusé à cette collection") {
      status = 403;
    } else if (
      msg.startsWith("Les oeuvres ne sont pas du même type que la collection:")
    ) {
      status = 422;
      const ids = msg.split(":")[1] ?? "";
      return res.status(status).json({
        success: false,
        errors: "Le type des œuvres doit correspondre au type de la collection",
        data: { mismatchedIds: ids ? ids.split(",") : [] },
      });
    }
    return res.status(status).json({ success: false, errors: msg, data: null });
  }
};
