import request from "supertest";
import { app } from "../app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createUserAndGetToken } from "./helpers/authHelper";

dotenv.config();

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Tests API - POST /collections", () => {
  test("Créer une collection avec des données valides retourne 201", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const collectionData = {
      name: "Ma collection de livres",
      type: "book",
      visibility: "public",
    };

    const res = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send(collectionData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Collection créée avec succès");
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.name).toBe(collectionData.name);
    expect(res.body.data.type).toBe(collectionData.type);
    expect(res.body.data.visibility).toBe(collectionData.visibility);
  });

  test("Créer une collection sans être authentifié retourne 401", async () => {
    const collectionData = {
      name: "Test collection",
      type: "movie",
      visibility: "private",
    };

    const res = await request(app).post("/collections").send(collectionData);

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Créer une collection avec un nom trop court retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const collectionData = {
      name: "ab",
      type: "book",
      visibility: "public",
    };

    const res = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send(collectionData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain(
      "Le nom doit contenir entre 3 et 50 caractères.",
    );
  });

  test("Créer une collection avec un type invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const collectionData = {
      name: "Test collection",
      type: "invalid_type",
      visibility: "public",
    };

    const res = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send(collectionData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain(
      "Le type doit être l'un des suivants: book, movie, series, music, game, other.",
    );
  });

  test("Créer une collection avec une visibilité invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const collectionData = {
      name: "Test collection",
      type: "book",
      visibility: "invalid_visibility",
    };

    const res = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send(collectionData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain("La visibilité doit être");
  });
});

describe("Tests API - GET /collections", () => {
  test("Récupérer toutes les collections publiques retourne 200", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { token: token2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        name: "Collection publique 1",
        type: "book",
        visibility: "public",
      });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        name: "Collection privée",
        type: "movie",
        visibility: "private",
      });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        name: "Collection publique 2",
        type: "music",
        visibility: "public",
      });

    const res = await request(app).get("/collections?visibility=public");

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Liste des collections publiques");
    expect(res.body.data.collections).toHaveLength(2);
    expect(res.body.data.collections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Collection publique 1" }),
        expect.objectContaining({ name: "Collection publique 2" }),
      ]),
    );
  });

  test("Récupérer toutes les collections sans authentification retourne uniquement les collections publiques", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection publique",
        type: "book",
        visibility: "public",
      });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection privée",
        type: "movie",
        visibility: "private",
      });

    const res = await request(app).get("/collections");

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.collections).toHaveLength(1);
    expect(res.body.data.collections[0].visibility).toBe("public");
  });
});

describe("Tests API - GET /collections/me", () => {
  test("Récupérer les collections de l'utilisateur connecté retourne 200", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ma collection 1", type: "book", visibility: "public" });

    await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ma collection 2", type: "movie", visibility: "private" });

    const res = await request(app)
      .get("/collections/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Vos collections");
    expect(res.body.data.collections).toHaveLength(2);
    expect(res.body.data.collections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Ma collection 1" }),
        expect.objectContaining({ name: "Ma collection 2" }),
      ]),
    );
  });

  test("Récupérer les collections sans authentification retourne 401", async () => {
    const res = await request(app).get("/collections/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });
});

describe("Tests API - GET /collections/:collectionId", () => {
  test("Récupérer une collection publique par ID retourne 200", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Collection test", type: "book", visibility: "public" });

    const collectionId = createRes.body.data._id;

    const res = await request(app).get(`/collections/${collectionId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Détails de la collection");
    expect(res.body.data.collection.name).toBe("Collection test");
  });

  test("Récupérer une collection privée sans être le propriétaire retourne 403", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { token: token2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token1}`)
      .send({ name: "Collection privée", type: "book", visibility: "private" });

    const collectionId = createRes.body.data._id;

    const res = await request(app)
      .get(`/collections/${collectionId}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Accès refusé à cette collection");
  });

  test("Récupérer une collection avec un ID invalide retourne 400", async () => {
    const res = await request(app).get("/collections/invalid-id");

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Identifiant de collection invalide");
  });

  test("Récupérer une collection inexistante retourne 404", async () => {
    const res = await request(app).get("/collections/123456789012345678901234");

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Collection non trouvée");
  });
});

describe("Tests API - PATCH /collections/:collectionId", () => {
  test("Mettre à jour sa propre collection retourne 200", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection originale",
        type: "book",
        visibility: "public",
      });

    const collectionId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/collections/${collectionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Collection modifiée", visibility: "private" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Collection mise à jour");
    expect(res.body.data.collection.name).toBe("Collection modifiée");
    expect(res.body.data.collection.visibility).toBe("private");
  });

  test("Mettre à jour une collection avec des champs non autorisés retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Collection test", type: "book", visibility: "public" });

    const collectionId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/collections/${collectionId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: "newUserId", name: "Nouveau nom" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Champs non modifiables détectés");
  });

  test("Mettre à jour la collection d'un autre utilisateur retourne 403", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { token: token2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token1}`)
      .send({ name: "Collection user1", type: "book", visibility: "public" });

    const collectionId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/collections/${collectionId}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ name: "Tentative de modification" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Accès refusé à cette collection");
  });

  test("Mettre à jour sans authentification retourne 401", async () => {
    const res = await request(app)
      .patch("/collections/123456789012345678901234")
      .send({ name: "Test" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });
});

describe("Tests API - DELETE /collections/:collectionId", () => {
  test("Supprimer sa propre collection retourne 200", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Collection à supprimer",
        type: "book",
        visibility: "public",
      });

    const collectionId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/collections/${collectionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Collection supprimée");

    const getRes = await request(app).get(`/collections/${collectionId}`);
    expect(getRes.status).toBe(404);
  });

  test("Supprimer la collection d'un autre utilisateur retourne 403", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { token: token2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/collections")
      .set("Authorization", `Bearer ${token1}`)
      .send({ name: "Collection user1", type: "book", visibility: "public" });

    const collectionId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/collections/${collectionId}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe(
      "Seul le propriétaire peut supprimer cette collection",
    );
  });

  test("Supprimer sans authentification retourne 401", async () => {
    const res = await request(app).delete(
      "/collections/123456789012345678901234",
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Supprimer une collection inexistante retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .delete("/collections/123456789012345678901234")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Collection non trouvée");
  });
});
