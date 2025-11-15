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
  updateUser,
  getUserByIdWithPassword,
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

export const updateUserProfile = async (
  userId: string,
  currentPassword: string,
  updateData: {
    username?: string;
    email?: string;
    newPassword?: string;
    profilePicture?: string;
  },
) => {
  if (!userId) {
    throw new Error("Il manque l'id");
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Format de l'id invalide");
  }

  // Récupérer l'utilisateur avec son mot de passe pour vérification
  const userWithPassword = await getUserByIdWithPassword(userId);
  if (!userWithPassword) {
    throw new Error("Utilisateur non trouvé");
  }

  // Vérifier le mot de passe actuel avec argon2
  const isPasswordValid = await argon2.verify(
    userWithPassword.password,
    currentPassword,
  );

  if (!isPasswordValid) {
    throw new Error("Mot de passe actuel incorrect");
  }

  // Récupérer les infos utilisateur sans le mot de passe
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new Error("Utilisateur non trouvé");
  }

  // Préparer les données à mettre à jour
  const dataToUpdate: Partial<IUser> = {};

  // Vérifier si le username est déjà pris par un autre utilisateur
  if (updateData.username && updateData.username !== existingUser.username) {
    const usernameCount = await countUsersByName(updateData.username);
    if (usernameCount > 0) {
      throw new Error("Ce pseudonyme existe déjà");
    }
    dataToUpdate.username = updateData.username;
  }

  // Vérifier si l'email est déjà pris par un autre utilisateur
  if (updateData.email && updateData.email !== existingUser.email) {
    const emailCount = await countUsersByEmail(updateData.email);
    if (emailCount > 0) {
      throw new Error("Ce mail est déjà attribué");
    }
    dataToUpdate.email = updateData.email;
  }

  // Hasher le nouveau mot de passe si fourni
  if (updateData.newPassword) {
    const hpwd = await hashPassword(updateData.newPassword);
    dataToUpdate.password = hpwd;
  }

  // Mettre à jour la photo de profil si fournie
  if (updateData.profilePicture !== undefined) {
    dataToUpdate.profilePicture = updateData.profilePicture;
  }

  // Si aucune donnée à mettre à jour
  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("Aucune donnée à mettre à jour");
  }

  return await updateUser(userId, dataToUpdate);
};

export const updateUserRole = async (
  userId: string,
  role: "admin" | "user" | "moderator",
) => {
  if (!userId) {
    throw new Error("Il manque l'id");
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Format de l'id invalide");
  }

  // Vérifier que l'utilisateur existe
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new Error("Utilisateur non trouvé");
  }

  // Mettre à jour le rôle
  return await updateUser(userId, { role });
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
