import mongoose from "mongoose";

export const connectDB = async (url: string | undefined) => {
  if (!url) throw new Error("URL MongoDB manquante");

  try {
    await mongoose.connect(url);
    console.log(`Connecté à la bdd`);
  } catch (err) {
    console.error(`Impossible de se connecter à la bdd :`, err);
    process.exit(1);
  }
};
