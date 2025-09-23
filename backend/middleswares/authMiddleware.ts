import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, errors: "Token manquant", data: null });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        errors: "Configuration JWT manquante",
        data: null,
      });
    }
    const decoded = jwt.verify(token, secret) as { sub: string; role: string };
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (_err) {
    return res
      .status(401)
      .json({ success: false, errors: "Token invalide ou expiré", data: null });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, errors: "Non authentifié", data: null });
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, errors: "Accès refusé", data: null });
    }
    next();
  };
};
