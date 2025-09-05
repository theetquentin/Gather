import express from "express";
import router from "./routers/indexRouter";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
