import jwt from "jsonwebtoken";
import * as argon2 from "argon2";
import { getUserByEmailWithPassword } from "../repositories/userRepository";

export interface JwtPayloadShape {
  sub: string; // user id
  role: string;
}

export const loginAndIssueToken = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email et mot de passe sont requis");
  }

  const user = await getUserByEmailWithPassword(email);
  if (!user) {
    throw new Error("Identifiants invalides");
  }

  const isValid = await argon2.verify(user.password as string, password);
  if (!isValid) {
    throw new Error("Identifiants invalides");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET manquant dans la configuration");
  }

  const assuredSecret: string = secret;

  const role: string = (user.role ?? "user") as string;
  const payload: JwtPayloadShape = { sub: user._id.toString(), role };
  const token = jwt.sign(payload, assuredSecret, { expiresIn: "1h" });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const { getUserById } = await import("../repositories/userRepository");
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
};
