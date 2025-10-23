import { Request, Response, NextFunction } from "express";
import DOMPurify from "isomorphic-dompurify";

// Types pour la fonction de sanitization
type SanitizableValue = string | number | boolean | null | undefined;
type SanitizableObject = { [key: string]: SanitizableInput };
type SanitizableArray = SanitizableInput[];
type SanitizableInput = SanitizableValue | SanitizableObject | SanitizableArray;

/**
 * Sanitize une valeur récursivement pour supprimer tout code HTML/JavaScript potentiellement dangereux
 * @param input - La valeur à sanitizer (string, object, array, etc.)
 * @returns La valeur sanitized
 */
export const sanitizeInput = (input: SanitizableInput): SanitizableInput => {
  // Si c'est une string, on la sanitize en supprimant tous les tags HTML
  if (typeof input === "string") {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Aucun tag HTML autorisé
      KEEP_CONTENT: true, // Garde le contenu texte
    }).trim();
  }

  // Si c'est un tableau, on sanitize chaque élément
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as SanitizableArray;
  }

  // Si c'est un objet, on sanitize chaque propriété récursivement
  if (typeof input === "object" && input !== null) {
    const sanitized: SanitizableObject = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput((input as SanitizableObject)[key]);
      }
    }
    return sanitized;
  }

  // Pour les autres types (number, boolean, null, undefined), on les retourne tels quels
  return input;
};

/**
 * Middleware Express qui sanitize le body, query et params de toutes les requêtes
 * Protège contre les attaques XSS en supprimant tout code HTML/JavaScript malveillant
 */
export const sanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // Sanitize le body (POST, PUT, PATCH)
  if (req.body) {
    req.body = sanitizeInput(req.body) as typeof req.body;
  }

  // Sanitize les query parameters (GET)
  if (req.query) {
    req.query = sanitizeInput(req.query) as typeof req.query;
  }

  // Sanitize les route parameters
  if (req.params) {
    req.params = sanitizeInput(req.params) as typeof req.params;
  }

  next();
};
