import { Response } from "express";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { CreateShareDto } from "../dtos/createShare.dto";
import { IShare } from "../interfaces/interface.ishare";
import {
  createNewShare,
  fetchSharesByGuest,
  fetchSharesByCollection,
  updateShareStatusById,
  deleteShareById,
} from "../services/shareService";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";
import { handleServiceError } from "../utils/errorHandler";

const shareErrorMap: Record<string, number> = {
  "Identifiant de partage invalide": 400,
  "Identifiant de collection invalide": 400,
  "Identifiant utilisateur invalide": 400,
  "Collection non trouvée": 404,
  "Utilisateur invité non trouvé": 404,
  "Auteur non trouvé": 404,
  "Partage non trouvé": 404,
  "Seul le propriétaire peut partager cette collection": 403,
  "Vous ne pouvez pas vous partager une collection à vous-même": 400,
  "Seul l'invité peut modifier le statut du partage": 403,
  "Seul l'auteur peut modifier ce partage": 403,
  "Vous n'êtes pas autorisé à supprimer ce partage": 403,
};

export const createShare = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const dto = plainToInstance(CreateShareDto, {
      ...req.body,
      authorId: req.user.id, // L'auteur est automatiquement l'utilisateur connecté
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

    const shareObject = instanceToPlain(dto) as unknown as IShare;
    const isStaff = req.user && ["admin", "moderator"].includes(req.user.role);
    const result = await createNewShare(shareObject, isStaff);

    return res.status(201).json({
      success: true,
      message: "Partage créé avec succès",
      data: {
        share: {
          _id: result._id,
          collectionId: result.collectionId,
          guestId: result.guestId,
          authorId: result.authorId,
          rights: result.rights,
          status: result.status,
        },
      },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, shareErrorMap);
  }
};

export const getMyShares = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const shares = await fetchSharesByGuest(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Liste de vos partages",
      data: { shares },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, shareErrorMap);
  }
};

export const getCollectionShares = async (
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
    const shares = await fetchSharesByCollection(collectionId);

    return res.status(200).json({
      success: true,
      message: "Liste des partages de la collection",
      data: { shares },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, shareErrorMap);
  }
};

export const updateShareStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { shareId } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "refused", "accepted"].includes(status)) {
      return res.status(400).json({
        success: false,
        errors: "Le statut doit être 'pending', 'refused' ou 'accepted'",
        data: null,
      });
    }

    const share = await updateShareStatusById(shareId, status, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Statut du partage mis à jour",
      data: { share },
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, shareErrorMap);
  }
};

export const deleteShare = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { shareId } = req.params;
    await deleteShareById(shareId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Partage supprimé",
      data: null,
    });
  } catch (err: unknown) {
    return handleServiceError(err, res, shareErrorMap);
  }
};
