import express from "express";
import { connectDB } from "./config/database";
import dotenv from "dotenv";
// import router from "./routers/indexRouter.js";

dotenv.config();
const { PORT } = process.env;

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`),
);
