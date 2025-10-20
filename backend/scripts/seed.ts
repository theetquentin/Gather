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
import { Types } from "mongoose";

// Définition locale de l'interface pour les données de seeding Work
interface IWorkSeed {
  _id?: string;
  title: string;
  author: string;
  publishedAt: Date;
  type: string;
  genre: string[];
  description?: string;
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

  // 3. Collections (seront créées dynamiquement après l'insertion des works)
  collections: [],

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

  // 5. Évaluations (seront créées dynamiquement après l'insertion des works)
  reviews: [],

  // 6. Notifications (seront créées dynamiquement après l'insertion des works)
  notifications: [],
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
      // Générer un _id MongoDB unique
      work._id = new Types.ObjectId().toString();

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
      // Les reviews seront ajoutées après l'insertion des reviews
      work.reviews = [];
      return work;
    });

    console.log(`Insertion de ${worksToInsert.length} Oeuvres...`);
    const insertedWorksResult = await Work.insertMany(worksToInsert);

    // Créer un index des works par type pour faciliter la création des collections
    const worksByType: Record<string, string[]> = {};
    insertedWorksResult.forEach((work) => {
      const workType = work.type as string;
      if (!worksByType[workType]) {
        worksByType[workType] = [];
      }
      worksByType[workType].push(work._id.toString());
    });

    // 4. Création des Collections avec de vrais works
    console.log("Insertion des Collections...");
    const collectionsToInsert = [
      {
        _id: "65b4f6b283d7a8e7d23f0101",
        name: "Classiques Philosophiques",
        type: "book",
        visibility: "public",
        userId: "65b4f6b283d7a8e7d23f00a1",
        works: worksByType["book"]?.slice(0, 5) || [],
        shared: [],
      },
      {
        _id: "65b4f6b283d7a8e7d23f0102",
        name: "Albums Rock 90s",
        type: "music",
        visibility: "private",
        userId: "65b4f6b283d7a8e7d23f00a2",
        works: worksByType["music"]?.slice(0, 4) || [],
        shared: ["65b4f6b283d7a8e7d23f0201"],
      },
      {
        _id: "65b4f6b283d7a8e7d23f0103",
        name: "Films Cultes",
        type: "movie",
        visibility: "shared",
        userId: "65b4f6b283d7a8e7d23f00a2",
        works: worksByType["movie"]?.slice(0, 6) || [],
        shared: ["65b4f6b283d7a8e7d23f0202"],
      },
      {
        _id: "65b4f6b283d7a8e7d23f0104",
        name: "Collection Perso",
        type: "other",
        visibility: "private",
        userId: "65b4f6b283d7a8e7d23f00a3",
        works: worksByType["movie"]?.slice(6, 10) || [],
        shared: [],
      },
    ];
    await Collection.insertMany(collectionsToInsert);

    // 5. Importation des Shares
    console.log("Insertion des Partages (Shares)...");
    await Share.insertMany(seedData.shares);

    // 6. Création des Reviews (Évaluations) avec de vrais works
    console.log("Insertion des Évaluations (Reviews)...");
    const reviewsToInsert = [];

    // Ajouter quelques reviews pour les premiers works de chaque type
    if (worksByType["book"]?.length > 0) {
      reviewsToInsert.push({
        _id: "65b4f6b283d7a8e7d23f0051",
        userId: "65b4f6b283d7a8e7d23f00a1",
        workId: worksByType["book"][0],
        rating: 5,
        comment: "Un classique intemporel qui mérite 5 étoiles.",
      });
      if (worksByType["book"].length > 1) {
        reviewsToInsert.push({
          _id: "65b4f6b283d7a8e7d23f0052",
          userId: "65b4f6b283d7a8e7d23f00a2",
          workId: worksByType["book"][1],
          rating: 4,
          comment: "Très poétique, un peu lent par moments.",
        });
      }
    }

    if (worksByType["movie"]?.length > 0) {
      reviewsToInsert.push({
        _id: "65b4f6b283d7a8e7d23f0053",
        userId: "65b4f6b283d7a8e7d23f00a3",
        workId: worksByType["movie"][0],
        rating: 5,
        comment: "Un chef-d'œuvre cinématographique. À voir absolument.",
      });
    }

    if (worksByType["music"]?.length > 0) {
      reviewsToInsert.push({
        _id: "65b4f6b283d7a8e7d23f0054",
        userId: "65b4f6b283d7a8e7d23f00a2",
        workId: worksByType["music"][0],
        rating: 5,
        comment: "L'album qui a marqué une génération, indémodable.",
      });
    }

    await Review.insertMany(reviewsToInsert);

    // 7. Création des Notifications avec de vrais works et collections
    console.log("Insertion des Notifications...");
    const notificationsToInsert: Array<{
      _id: string;
      userId: string;
      senderId: string | null;
      workId?: string | null;
      collectionId?: string | null;
      type: string;
      message: string;
      readAt: Date | null;
    }> = [];

    // Ajouter une notification de review si on a des reviews et des works
    if (reviewsToInsert.length > 0 && worksByType["book"]?.length > 0) {
      notificationsToInsert.push({
        _id: "65b4f6b283d7a8e7d23f0301",
        userId: "65b4f6b283d7a8e7d23f00a1",
        senderId: "65b4f6b283d7a8e7d23f00a2",
        workId: worksByType["book"][0],
        type: "review",
        message: "AliceUser a ajouté une nouvelle évaluation sur une oeuvre.",
        readAt: new Date(),
      });
    }

    notificationsToInsert.push({
      _id: "65b4f6b283d7a8e7d23f0302",
      userId: "65b4f6b283d7a8e7d23f00a3",
      senderId: "65b4f6b283d7a8e7d23f00a2",
      collectionId: "65b4f6b283d7a8e7d23f0103",
      type: "share",
      message:
        "AliceUser vous a invité à collaborer sur la collection 'Films Cultes' (droits d'édition).",
      readAt: null,
    });

    notificationsToInsert.push({
      _id: "65b4f6b283d7a8e7d23f0303",
      userId: "65b4f6b283d7a8e7d23f00a2",
      senderId: null,
      workId: null,
      collectionId: null,
      type: "alert",
      message: "Bienvenue sur Gather ! Commencez à créer vos collections.",
      readAt: null,
    });

    await Notification.insertMany(notificationsToInsert);

    console.log("Jeu de données inséré avec succès !");
    process.exit();
  } catch (error) {
    console.error("Erreur lors de l'importation des données :", error);
    process.exit(1);
  }
};

importData();
