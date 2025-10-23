import * as argon2 from "argon2";
import { Types } from "mongoose";
import { IUser } from "../interfaces/interface.iuser";
import {
  createUser,
  getAllUsers,
  getUserById,
  countUsersByName,
  countUsersByEmail,
  searchUsers,
} from "../repositories/userRepository";

export const createNewUser = async (data: IUser) => {
  const { username, email, password }: IUser = data;

  const isUsernameTaken = await countUsersByName(username);

  const isEmailTaken = await countUsersByEmail(email);

  if (isUsernameTaken > 0) throw new Error("Ce pseudonyme existe déjà");
  if (isEmailTaken > 0) throw new Error("Ce mail est déjà attribué");

  const hpwd = await hashPassword(password);

  return await createUser({ username, email, password: hpwd });
};

export const fetchUsers = async () => {
  return await getAllUsers();
};

export const fetchUserById = async (userId: string) => {
  if (!userId) {
    throw new Error("Il manque l'id");
  }
  // l'id en mongodb est de 24 caractères hexadécimaux, autre que ça lève cette erreur
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Format de l'id invalide");
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  return user;
};

export const searchUsersByQuery = async (query: string) => {
  const trimmedQuery = query ? query.trim() : "";
  if (trimmedQuery.length < 2 || trimmedQuery.length > 50) {
    throw new Error("La recherche doit contenir entre 2 et 50 caractères");
  }
  return await searchUsers(trimmedQuery);
};

export async function hashPassword(password: string): Promise<string> {
  if (Array.isArray(password)) {
    throw new Error("Le mot de passe ne peut pas être un tableau.");
  }
  try {
    const hash: string = await argon2.hash(password);
    return hash;
  } catch (err) {
    // 'err' est de type 'unknown', il faut donc le vérifier ou le forcer
    if (err instanceof Error) {
      throw new Error(
        `Erreur lors du hachage du mot de passe : ${err.message}`,
      );
    }
    throw new Error("Une erreur inconnue est survenue lors du hachage.");
  }
}
