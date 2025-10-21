import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { LoginDto } from "../dtos/login.dto";
import { loginAndIssueToken } from "../services/authService";
import { fetchUserById } from "../services/userService";
import { AuthenticatedRequest } from "../middleswares/authMiddleware";

export const login = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance<LoginDto, Record<string, unknown>>(
      LoginDto,
      req.body as Record<string, unknown>,
    );
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

    const { email, password } = dto;
    const result = await loginAndIssueToken(email, password);

    return res.status(200).json({
      success: true,
      message: "Authentification réussie",
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "Identifiants invalides") {
        return res
          .status(401)
          .json({ success: false, errors: err.message, data: null });
      }
      return res
        .status(400)
        .json({ success: false, errors: err.message, data: null });
    }
    return res.status(500).json({
      success: false,
      errors: "Une erreur serveur est survenue",
      data: null,
    });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errors: "Non authentifié",
        data: null,
      });
    }

    const user = await fetchUserById(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Utilisateur récupéré avec succès",
      data: user,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    const status = msg === "Utilisateur non trouvé" ? 404 : 500;
    return res.status(status).json({ success: false, errors: msg, data: null });
  }
};
