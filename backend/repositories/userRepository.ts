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

export const searchUsers = async (query: string) => {
  // Recherche insensible à la casse sur username ou email
  const regex = new RegExp(query, "i");
  return await User.find({
    $or: [{ username: regex }, { email: regex }],
  })
    .select("-password")
    .limit(10); // Limite à 10 résultats
};
