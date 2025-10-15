import { connectDB } from "./config/database";
import dotenv from "dotenv";
import { app } from "./app";

dotenv.config({ path: "../.env" });
const { BACKEND_PORT } = process.env;
const { NODE_ENV } = process.env;
const { API_DOMAIN } = process.env;

connectDB(process.env.MONGO_URI);

const connectString =
  NODE_ENV === "dev"
    ? `http://localhost:${BACKEND_PORT}`
    : `http://${API_DOMAIN}`;

app.listen(BACKEND_PORT, () =>
  console.log(`Server is running at ${connectString}`),
);
