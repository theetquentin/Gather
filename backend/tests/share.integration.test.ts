import request from "supertest";
import { app } from "../app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createUserAndGetToken } from "./helpers/authHelper";
import Share from "../models/Share";
import { IShare } from "../interfaces/interface.ishare";

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

const createCollection = async (
  token: string,
  data: { name?: string; type?: string; visibility?: string } = {},
) => {
  const res = await request(app)
    .post("/collections")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Test Collection",
      type: "book",
      visibility: "private",
      ...data,
    });
  return res.body.data;
};

const createShare = async (
  authorId: string,
  collectionId: string,
  guestId: string,
  data: Partial<IShare> = {},
) => {
  return await Share.create({
    authorId: new mongoose.Types.ObjectId(authorId),
    collectionId: new mongoose.Types.ObjectId(collectionId),
    guestId: new mongoose.Types.ObjectId(guestId),
    rights: "read",
    status: "pending",
    ...data,
  });
};

describe("Tests API - POST /shares", () => {
  test("Créer un partage avec des données valides retourne 201", async () => {
    const { token: token1, user: user1 } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: user2 } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(token1);

    const shareData = {
      collectionId: collection._id,
      guestId: user2.id,
      rights: "read",
    };

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token1}`)
      .send(shareData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Partage créé avec succès");
    expect(res.body.data.share).toHaveProperty("_id");
    expect(res.body.data.share.collectionId).toBe(collection._id);
    expect(res.body.data.share.guestId).toBe(user2.id);
    expect(res.body.data.share.authorId).toBe(user1.id);
    expect(res.body.data.share.rights).toBe("read");
    expect(res.body.data.share.status).toBe("pending");
  });

  test("Créer un partage sans authentification retourne 401", async () => {
    const res = await request(app).post("/shares").send({
      collectionId: "123456789012345678901234",
      guestId: "123456789012345678901234",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Créer un partage avec un collectionId invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token}`)
      .send({
        collectionId: "invalid-id",
        guestId: "123456789012345678901234",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain("ObjectId valide");
  });

  test("Créer un partage avec un guestId invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token}`)
      .send({
        collectionId: "123456789012345678901234",
        guestId: "invalid-id",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain("ObjectId valide");
  });

  test("Créer un partage pour une collection inexistante retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token}`)
      .send({
        collectionId: "123456789012345678901234",
        guestId: guest.id,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Collection non trouvée");
  });

  test("Créer un partage pour un utilisateur invité inexistant retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(token);

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token}`)
      .send({
        collectionId: collection._id,
        guestId: "123456789012345678901234",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Utilisateur invité non trouvé");
  });

  test("Partager sa propre collection à soi-même retourne 400", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(token);

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token}`)
      .send({
        collectionId: collection._id,
        guestId: user.id,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe(
      "Vous ne pouvez pas vous partager une collection à vous-même",
    );
  });

  test("Partager une collection dont on n'est pas le propriétaire retourne 403", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { token: token2 } = await createUserAndGetToken({
      username: "notowner",
      email: "notowner@example.com",
      password: "Password123!",
    });

    const { user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(token1);

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        collectionId: collection._id,
        guestId: guest.id,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe(
      "Seul le propriétaire peut partager cette collection",
    );
  });

  test("Créer un partage avec des droits 'edit' retourne 201", async () => {
    const { token } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(token);

    const res = await request(app)
      .post("/shares")
      .set("Authorization", `Bearer ${token}`)
      .send({
        collectionId: collection._id,
        guestId: guest.id,
        rights: "edit",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.share.rights).toBe("edit");
  });
});

describe("Tests API - GET /shares/me", () => {
  test("Récupérer mes partages retourne 200", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { token: guestToken, user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection1 = await createCollection(ownerToken, {
      name: "Collection 1",
    });
    const collection2 = await createCollection(ownerToken, {
      name: "Collection 2",
    });

    await createShare(owner.id, collection1._id, guest.id);
    await createShare(owner.id, collection2._id, guest.id);

    const res = await request(app)
      .get("/shares/me")
      .set("Authorization", `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Liste de vos partages");
    expect(res.body.data.shares).toHaveLength(2);
  });

  test("Récupérer mes partages sans authentification retourne 401", async () => {
    const res = await request(app).get("/shares/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Récupérer mes partages ne retourne que les partages où je suis invité", async () => {
    const { token: owner1Token, user: owner1 } = await createUserAndGetToken({
      username: "owner1",
      email: "owner1@example.com",
      password: "Password123!",
    });

    const { token: guest1Token, user: guest1 } = await createUserAndGetToken({
      username: "guest1",
      email: "guest1@example.com",
      password: "Password123!",
    });

    const { user: guest2 } = await createUserAndGetToken({
      username: "guest2",
      email: "guest2@example.com",
      password: "Password123!",
    });

    const collection1 = await createCollection(owner1Token, {
      name: "Collection 1",
    });
    const collection2 = await createCollection(owner1Token, {
      name: "Collection 2",
    });

    await createShare(owner1.id, collection1._id, guest1.id);
    await createShare(owner1.id, collection2._id, guest2.id);

    const res = await request(app)
      .get("/shares/me")
      .set("Authorization", `Bearer ${guest1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.shares).toHaveLength(1);
  });
});

describe("Tests API - GET /shares/collection/:collectionId", () => {
  test("Récupérer les partages d'une collection retourne 200", async () => {
    const { token, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: guest1 } = await createUserAndGetToken({
      username: "guest1",
      email: "guest1@example.com",
      password: "Password123!",
    });

    const { user: guest2 } = await createUserAndGetToken({
      username: "guest2",
      email: "guest2@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(token);

    await createShare(owner.id, collection._id, guest1.id);
    await createShare(owner.id, collection._id, guest2.id);

    const res = await request(app)
      .get(`/shares/collection/${collection._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Liste des partages de la collection");
    expect(res.body.data.shares).toHaveLength(2);
  });

  test("Récupérer les partages sans authentification retourne 401", async () => {
    const res = await request(app).get(
      "/shares/collection/123456789012345678901234",
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Récupérer les partages avec un collectionId invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get("/shares/collection/invalid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Identifiant de collection invalide");
  });

  test("Récupérer les partages d'une collection inexistante retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get("/shares/collection/123456789012345678901234")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Collection non trouvée");
  });
});

describe("Tests API - PATCH /shares/:shareId/status", () => {
  test("Modifier le statut d'un partage en 'accepted' retourne 200", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { token: guestToken, user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .patch(`/shares/${share._id}/status`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Statut du partage mis à jour");
    expect(res.body.data.share.status).toBe("accepted");
  });

  test("Modifier le statut d'un partage en 'refused' retourne 200", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { token: guestToken, user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .patch(`/shares/${share._id}/status`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ status: "refused" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.share.status).toBe("refused");
  });

  test("Modifier le statut sans authentification retourne 401", async () => {
    const res = await request(app)
      .patch("/shares/123456789012345678901234/status")
      .send({ status: "accepted" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Modifier le statut avec un shareId invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/shares/invalid-id/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Identifiant de partage invalide");
  });

  test("Modifier le statut avec un statut invalide retourne 400", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { token: guestToken, user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .patch(`/shares/${share._id}/status`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ status: "invalid_status" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe(
      "Le statut doit être 'pending', 'refused' ou 'accepted'",
    );
  });

  test("Modifier le statut d'un partage inexistant retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/shares/123456789012345678901234/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Partage non trouvé");
  });

  test("Seul l'invité peut modifier le statut du partage retourne 403", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const { token: otherToken } = await createUserAndGetToken({
      username: "other",
      email: "other@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .patch(`/shares/${share._id}/status`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe(
      "Seul l'invité peut modifier le statut du partage",
    );
  });
});

describe("Tests API - DELETE /shares/:shareId", () => {
  test("Supprimer un partage en tant qu'auteur retourne 200", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .delete(`/shares/${share._id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Partage supprimé");

    // Vérifier que le partage est bien supprimé
    const shareInDb = await Share.findById(share._id);
    expect(shareInDb).toBeNull();
  });

  test("Supprimer un partage en tant qu'invité retourne 200", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { token: guestToken, user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .delete(`/shares/${share._id}`)
      .set("Authorization", `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Partage supprimé");
  });

  test("Supprimer sans authentification retourne 401", async () => {
    const res = await request(app).delete("/shares/123456789012345678901234");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Supprimer un partage avec un ID invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .delete("/shares/invalid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Identifiant de partage invalide");
  });

  test("Supprimer un partage inexistant retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .delete("/shares/123456789012345678901234")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Partage non trouvé");
  });

  test("Supprimer le partage d'un autre utilisateur retourne 403", async () => {
    const { token: ownerToken, user: owner } = await createUserAndGetToken({
      username: "owner",
      email: "owner@example.com",
      password: "Password123!",
    });

    const { user: guest } = await createUserAndGetToken({
      username: "guest",
      email: "guest@example.com",
      password: "Password123!",
    });

    const { token: otherToken } = await createUserAndGetToken({
      username: "other",
      email: "other@example.com",
      password: "Password123!",
    });

    const collection = await createCollection(ownerToken);
    const share = await createShare(owner.id, collection._id, guest.id);

    const res = await request(app)
      .delete(`/shares/${share._id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe(
      "Vous n'êtes pas autorisé à supprimer ce partage",
    );
  });
});
