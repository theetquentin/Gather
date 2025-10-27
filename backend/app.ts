import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoSanitize from "express-mongo-sanitize";
import router from "./routers/indexRouter";
import { sanitizeMiddleware } from "./middleswares/sanitizeMiddleware";

dotenv.config({ path: "../.env" });

export const app = express();

// Configuration CORS pour permettre les requêtes depuis le frontend
const corsOptions = {
  origin:
    process.env.NODE_ENV === "dev"
      ? `http://localhost:${process.env.FRONTEND_PORT}`
      : `https://${process.env.DOMAIN}`,
  credentials: true,
};

// autorisations entre les domaines
app.use(cors(corsOptions));

// Parsers pour le body des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protection contre les injections NoSQL
// Remplace les caractères interdits ($, .) par '_' dans req.body, req.query et req.params
app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ key }: { req: unknown; key: string }) => {
      console.warn(
        `[SECURITY] Tentative d'injection NoSQL détectée sur: ${key}`,
      );
    },
  }),
);

// Protection contre les attaques XSS
// Sanitize tous les inputs HTML pour supprimer les scripts malveillants
app.use(sanitizeMiddleware);

app.use("/", router);
