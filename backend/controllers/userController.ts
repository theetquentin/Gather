import { IUser } from "../interfaces/interface.iuser";
import {
  createNewUser,
  fetchUsers,
  fetchUserById,
} from "../services/userService";
import { Request, Response } from "express";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { CreateUserDto } from "../dtos/createUser.dto";

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
        id: newUser._id,
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
