import { connectDB } from "../config/database";
import { hashPassword } from "../services/userService";
import dotenv from "dotenv";
import Work from "../models/Work";
import User from "../models/User";
import Collection from "../models/Collection";
import Share from "../models/Share";
import Review from "../models/Review";
import Notification from "../models/Notification";
import fs from "fs";

// Définition locale de l'interface pour les données de seeding Work
interface IWorkSeed {
  _id: string;
  title: string;
  author: string;
  publishedAt: Date;
  type: string;
  genre: string[];
  images?: string[];
  reviews?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

dotenv.config({ path: "../.env" });
const WORKS_DATA_PATH = "./scripts/works_data.json";

const seedData = {
  // 2. Utilisateurs
  users: [
    {
      _id: "65b4f6b283d7a8e7d23f00a1",
      username: "AdminMaster",
      email: "admin@example.com",
      password: "Admin123!",
      role: "admin",
      collections: ["65b4f6b283d7a8e7d23f0101"],
      shared: [],
    },
    {
      _id: "65b4f6b283d7a8e7d23f00a2",
      username: "AliceUser",
      email: "alice@example.com",
      password: "Alice123!",
      role: "user",
      collections: ["65b4f6b283d7a8e7d23f0102", "65b4f6b283d7a8e7d23f0103"],
      shared: ["65b4f6b283d7a8e7d23f0201"],
    },
    {
      _id: "65b4f6b283d7a8e7d23f00a3",
      username: "BobModerator",
      email: "bob@example.com",
      password: "Bobmoderator123!",
      role: "moderator",
      collections: ["65b4f6b283d7a8e7d23f0104"],
      shared: ["65b4f6b283d7a8e7d23f0202", "65b4f6b283d7a8e7d23f0201"],
    },
  ],

  // 3. Collections
  collections: [
    {
      _id: "65b4f6b283d7a8e7d23f0101",
      name: "Classiques Philosophiques",
      type: "book",
      visibility: "public",
      userId: "65b4f6b283d7a8e7d23f00a1",
      works: [
        "65b4f6b283d7a8e7d23f0001",
        "65b4f6b283d7a8e7d23f0006",
        "65b4f6b283d7a8e7d23f000b",
        "65b4f6b283d7a8e7d23f0016",
      ],
      shared: [],
    },
    {
      _id: "65b4f6b283d7a8e7d23f0102",
      name: "Albums Rock 90s",
      type: "music",
      visibility: "private",
      userId: "65b4f6b283d7a8e7d23f00a2",
      works: [
        "65b4f6b283d7a8e7d23f002b",
        "65b4f6b283d7a8e7d23f0040",
        "65b4f6b283d7a8e7d23f0041",
      ],
      shared: ["65b4f6b283d7a8e7d23f0201"],
    },
    {
      _id: "65b4f6b283d7a8e7d23f0103",
      name: "Voyages Dystopiques",
      type: "book",
      visibility: "shared",
      userId: "65b4f6b283d7a8e7d23f00a2",
      works: ["65b4f6b283d7a8e7d23f0002", "65b4f6b283d7a8e7d23f001c"],
      shared: ["65b4f6b283d7a8e7d23f0202"],
    },
    {
      _id: "65b4f6b283d7a8e7d23f0104",
      name: "Films & Séries",
      type: "other",
      visibility: "private",
      userId: "65b4f6b283d7a8e7d23f00a3",
      works: [],
      shared: [],
    },
  ],

  // 4. Partages
  shares: [
    {
      _id: "65b4f6b283d7a8e7d23f0201",
      collectionId: "65b4f6b283d7a8e7d23f0102",
      guestId: "65b4f6b283d7a8e7d23f00a3",
      authorId: "65b4f6b283d7a8e7d23f00a2",
      rights: "read",
      status: "accepted",
    },
    {
      _id: "65b4f6b283d7a8e7d23f0202",
      collectionId: "65b4f6b283d7a8e7d23f0103",
      guestId: "65b4f6b283d7a8e7d23f00a3",
      authorId: "65b4f6b283d7a8e7d23f00a2",
      rights: "edit",
      status: "pending",
    },
  ],

  // 5. Évaluations
  reviews: [
    {
      _id: "65b4f6b283d7a8e7d23f0051",
      userId: "65b4f6b283d7a8e7d23f00a1",
      workId: "65b4f6b283d7a8e7d23f0001",
      rating: 5,
      comment: "Un classique intemporel qui mérite 5 étoiles.",
    },
    {
      _id: "65b4f6b283d7a8e7d23f0052",
      userId: "65b4f6b283d7a8e7d23f00a2",
      workId: "65b4f6b283d7a8e7d23f0001",
      rating: 4,
      comment: "Très poétique, un peu lent par moments.",
    },
    {
      _id: "65b4f6b283d7a8e7d23f0053",
      userId: "65b4f6b283d7a8e7d23f00a3",
      workId: "65b4f6b283d7a8e7d23f0002",
      rating: 5,
      comment: "Le chef-d'œuvre de la dystopie. Effrayant de réalisme.",
    },
    {
      _id: "65b4f6b283d7a8e7d23f0054",
      userId: "65b4f6b283d7a8e7d23f00a2",
      workId: "65b4f6b283d7a8e7d23f002a",
      rating: 5,
      comment: "L'album qui a marqué une génération, indémodable.",
    },
  ],

  // 6. Notifications
  notifications: [
    {
      _id: "65b4f6b283d7a8e7d23f0301",
      userId: "65b4f6b283d7a8e7d23f00a1",
      senderId: "65b4f6b283d7a8e7d23f00a2",
      workId: "65b4f6b283d7a8e7d23f0001",
      type: "review",
      message:
        "AliceUser a ajouté une nouvelle évaluation pour 'Le Petit Prince'.",
      readAt: new Date(),
    },
    {
      _id: "65b4f6b283d7a8e7d23f0302",
      userId: "65b4f6b283d7a8e7d23f00a3",
      senderId: "65b4f6b283d7a8e7d23f00a2",
      collectionId: "65b4f6b283d7a8e7d23f0103",
      type: "share",
      message:
        "AliceUser vous a invité à collaborer sur la collection 'Voyages Dystopiques' (droits d'édition).",
      readAt: null,
    },
    {
      _id: "65b4f6b283d7a8e7d23f0303",
      userId: "65b4f6b283d7a8e7d23f00a2",
      senderId: null,
      workId: null,
      collectionId: null,
      type: "alert",
      message:
        "Votre abonnement expire bientôt. Veuillez renouveler pour continuer à partager vos collections.",
      readAt: null,
    },
  ],
};

const importData = async () => {
  try {
    console.log("Connexion à MongoDB...");
    await connectDB(process.env.MONGO_URI);

    // 1. Suppression des données existantes
    console.log("Nettoyage de la base de données...");
    await User.deleteMany();
    await Work.deleteMany();
    await Collection.deleteMany();
    await Share.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();

    // 2. Importation des Users
    console.log("Insertion des Utilisateurs...");
    const usersWithHashedPasswords = await Promise.all(
      seedData.users.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password as unknown as string),
      })),
    );
    await User.insertMany(usersWithHashedPasswords);

    // 3. Importation des Works depuis le fichier JSON
    const worksJson = JSON.parse(fs.readFileSync(WORKS_DATA_PATH, "utf-8"));

    const worksToInsert = worksJson.map((work: IWorkSeed) => {
      // Convertir publishedAt en Date
      if (typeof work.publishedAt === "string") {
        const date = new Date(work.publishedAt);
        if (isNaN(date.valueOf())) {
          throw new Error(
            `Date invalide pour l'oeuvre "${work.title}": ${work.publishedAt}`,
          );
        }
        work.publishedAt = date;
      }
      // rajout des reviews (evaluations)
      work.reviews = seedData.reviews
        .filter((r) => r.workId === work._id)
        .map((r) => r._id);
      return work;
    });

    console.log(`Insertion de ${worksToInsert.length} Oeuvres...`);
    await Work.insertMany(worksToInsert);

    // 4. Importation des Collections
    console.log("Insertion des Collections...");
    await Collection.insertMany(seedData.collections);

    // 5. Importation des Shares
    console.log("Insertion des Partages (Shares)...");
    await Share.insertMany(seedData.shares);

    // 6. Importation des Reviews (Évaluations)
    // Les Reviews doivent être insérées après les Works et Users
    console.log("Insertion des Évaluations (Reviews)...");
    await Review.insertMany(seedData.reviews);

    // 7. Importation des Notifications
    console.log("Insertion des Notifications...");
    await Notification.insertMany(seedData.notifications);

    console.log("Jeu de données inséré avec succès !");
    process.exit();
  } catch (error) {
    console.error("Erreur lors de l'importation des données :", error);
    process.exit(1);
  }
};

importData();
