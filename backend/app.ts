import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/indexRouter";

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);
