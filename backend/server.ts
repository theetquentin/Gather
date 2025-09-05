import { connectDB } from "./config/database";
import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();
const { PORT } = process.env;

connectDB(process.env.MONGO_URI);

app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`),
);
