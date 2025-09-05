import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const getMongoUri = () => {
//   if (process.env.NODE_ENV === "test") {
//     if (!process.env.MONGO_TEST_URI) {
//       throw new Error("MONGO_TEST_URI non défini pour l'environnement de test");
//     }
//     return process.env.MONGO_TEST_URI;
//   }

//   if (!process.env.MONGO_URI) {
//     throw new Error("MONGO_URI non défini pour l'environnement de production");
//   }

//   return process.env.MONGO_URI;
// };

export const connectDB = async (url: string | undefined) => {
  if (!url) throw new Error("l'url de MongoDB est manquante");

  try {
    await mongoose.connect(url);
    console.log(`Connecté à la BDD (${process.env.NODE_ENV})`);
  } catch (err) {
    console.error("Impossible de se connecter à la BDD :", err);
  }
};

export const clearDB = async () => {
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};
