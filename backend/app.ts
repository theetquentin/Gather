import express from "express";
import cors from "cors";
import router from "./routers/indexRouter";

export const app = express();

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
