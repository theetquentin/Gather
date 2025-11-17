import { IUser } from "../interfaces/interface.iuser";
import User from "../models/User";

export const createUser = async (data: IUser) => {
  return await User.create({
    username: data.username,
    email: data.email,
    password: data.password,
  });
};

export const getAllUsers = async () => {
  return await User.find().select("-password");
};

export const getUserById = async (userId: string) => {
  return await User.findById(userId).select("-password");
};

export const countUsersByName = async (tag: string) => {
  return await User.countDocuments({ username: tag });
};

export const countUsersByEmail = async (mail: string) => {
  return await User.countDocuments({ email: mail });
};

export const getUserByEmailWithPassword = async (mail: string) => {
  // utile pour authentification
  return await User.findOne({ email: mail }).select("+password");
};

export const getUserByIdWithPassword = async (userId: string) => {
  // utile pour vérification du mot de passe actuel
  return await User.findById(userId).select("+password");
};

export const searchUsers = async (query: string) => {
  // Sanitization: échapper tous les caractères spéciaux de regex pour éviter l'injection NoSQL
  const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Recherche insensible à la casse sur username ou email avec query sanitized
  const regex = new RegExp(sanitizedQuery, "i");
  return await User.find({
    $or: [{ username: regex }, { email: regex }],
  })
    .select("_id username email profilePicture role")
    .limit(10);
};

export const updateUser = async (
  userId: string,
  updateData: Partial<IUser>,
) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("_id username email role profilePicture");
};
