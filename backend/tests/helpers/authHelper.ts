import request from "supertest";
import User from "../../models/User";
import { app } from "../../app";

interface CreateUserOptions {
  username?: string;
  email?: string;
  password?: string;
  role?: "user" | "admin" | "moderator";
}

interface AuthResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Crée un utilisateur, ajuste son rôle, se connecte et retourne { token, user }
 */
export async function createUserAndGetToken({
  username = "user",
  email = "user@example.com",
  password = "Password123!",
  role = "user",
}: CreateUserOptions = {}): Promise<AuthResult> {
  await request(app).post("/users").send({ username, email, password });

  // Ajuste le rôle si différent de "user"
  if (role !== "user") {
    const dbUser = await User.findOne({ email });
    if (dbUser) {
      dbUser.role = role;
      await dbUser.save();
    }
  }

  // Se connecte pour récupérer le token JWT
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email, password });

  if (loginRes.status !== 200 || !loginRes.body.data?.token) {
    throw new Error(`Échec de connexion pour ${email}`);
  }

  const token = loginRes.body.data.token;
  const user = loginRes.body.data.user;

  return { token, user };
}
