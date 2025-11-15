import { IUser } from "../interfaces/interface.iuser";
import {
  createNewUser,
  fetchUsers,
  fetchUserById,
  searchUsersByQuery,
  updateUserProfile,
  updateUserRole as updateUserRoleService,
} from "../services/userService";
import { Request, Response } from "express";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { CreateUserDto } from "../dtos/createUser.dto";
import { UpdateUserDto } from "../dtos/updateUser.dto";
import { UpdateUserRoleDto } from "../dtos/updateUserRole.dto";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";

export const createUser = async (req: Request, res: Response) => {
  try {
    // Transformer le corps de la requête en instance du DTO
    const userDto = plainToInstance(CreateUserDto, req.body);

    // 2. Valider l'instance du DTO
    const errors = await validate(userDto);
    if (errors.length > 0) {
      const firstError = errors[0];
      const firstMessage = firstError.constraints
        ? Object.values(firstError.constraints)[0]
        : "Données invalides";
      return res.status(400).json({ success: false, errors: firstMessage });
    }

    // Après validation
    // On transforme l'instance de la classe DTO en objet pour la requête
    const userObject = instanceToPlain(userDto) as IUser;
    const newUser = await createNewUser(userObject);

    return res.status(201).json({
      success: true,
      message: "User created with success",
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res
        .status(400)
        .json({ success: false, errors: err.message, data: null });
    } else {
      return res.status(500).json({
        success: false,
        errors: "Une erreur serveur est survenue",
        data: null,
      });
    }
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await fetchUsers();
    return res.status(200).json({
      success: true,
      message: "List of all users",
      data: { users },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res
        .status(400)
        .json({ success: false, errors: err.message, data: null });
    } else {
      return res.status(500).json({
        success: false,
        errors: "Une erreur serveur est survenue",
        data: null,
      });
    }
  }
};

export const findUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await fetchUserById(userId);
    res.status(200).json({
      success: true,
      message: `Here's the user for the id ${userId}`,
      data: { user },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Vérifie le message renvoyé par le service
      if (err.message === "Utilisateur non trouvé") {
        return res.status(404).json({
          success: false,
          errors: err.message,
          data: null,
        });
      }

      if (err.message === "Format de l'id invalide") {
        return res.status(400).json({
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
    }
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        errors: "Le paramètre de recherche 'q' est requis",
        data: null,
      });
    }

    const users = await searchUsersByQuery(q);
    return res.status(200).json({
      success: true,
      message: "Résultats de recherche",
      data: { users },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(400).json({
        success: false,
        errors: err.message,
        data: null,
      });
    } else {
      return res.status(500).json({
        success: false,
        errors: "Une erreur serveur est survenue",
        data: null,
      });
    }
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    const { userId } = req.params;

    // Vérifier que l'utilisateur modifie son propre profil ou est admin/moderator
    const isOwner = req.user.id === userId;
    const isAdminOrModerator = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isAdminOrModerator) {
      return res.status(403).json({
        success: false,
        errors: "Vous n'êtes pas autorisé à modifier ce profil",
        data: null,
      });
    }

    // Transformer le corps de la requête en instance du DTO
    const updateDto = plainToInstance(UpdateUserDto, req.body);

    // Valider l'instance du DTO
    const errors = await validate(updateDto);
    if (errors.length > 0) {
      const firstError = errors[0];
      const firstMessage = firstError.constraints
        ? Object.values(firstError.constraints)[0]
        : "Données invalides";
      return res.status(400).json({ success: false, errors: firstMessage });
    }

    // Extraire le mot de passe actuel
    const { currentPassword } = updateDto;

    // Filtrer uniquement les champs autorisés (évite l'injection de champs dangereux)
    const updateData: {
      username?: string;
      email?: string;
      newPassword?: string;
    } = {};

    if (updateDto.username) updateData.username = updateDto.username;
    if (updateDto.email) updateData.email = updateDto.email;
    if (updateDto.newPassword) updateData.newPassword = updateDto.newPassword;

    const updatedUser = await updateUserProfile(
      userId,
      currentPassword,
      updateData,
    );

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: { user: updatedUser },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Gestion des erreurs spécifiques
      if (err.message === "Utilisateur non trouvé") {
        return res.status(404).json({
          success: false,
          errors: err.message,
          data: null,
        });
      }

      if (
        err.message === "Format de l'id invalide" ||
        err.message === "Ce pseudonyme existe déjà" ||
        err.message === "Ce mail est déjà attribué" ||
        err.message === "Aucune donnée à mettre à jour" ||
        err.message === "Mot de passe actuel incorrect"
      ) {
        return res.status(400).json({
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
    }
  }
};

export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    }

    // Seuls les admins peuvent modifier les rôles
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        errors: "Accès refusé : réservé aux administrateurs",
        data: null,
      });
    }

    const { userId } = req.params;

    // Transformer le corps de la requête en instance du DTO
    const roleDto = plainToInstance(UpdateUserRoleDto, req.body);

    // Valider l'instance du DTO
    const errors = await validate(roleDto);
    if (errors.length > 0) {
      const firstError = errors[0];
      const firstMessage = firstError.constraints
        ? Object.values(firstError.constraints)[0]
        : "Données invalides";
      return res.status(400).json({ success: false, errors: firstMessage });
    }

    const updatedUser = await updateUserRoleService(userId, roleDto.role);

    return res.status(200).json({
      success: true,
      message: "Rôle mis à jour avec succès",
      data: { user: updatedUser },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "Utilisateur non trouvé") {
        return res.status(404).json({
          success: false,
          errors: err.message,
          data: null,
        });
      }

      if (err.message === "Format de l'id invalide") {
        return res.status(400).json({
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
    }
  }
};
