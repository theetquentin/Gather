import request from "supertest";
import { app } from "../app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createUserAndGetToken } from "./helpers/authHelper";
import Notification from "../models/Notification";
import { INotification } from "../interfaces/interface.inotification";

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

const createNotification = async (
  userId: string,
  data: Partial<INotification> = {},
) => {
  return await Notification.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "alert",
    message: "Test notification",
    ...data,
  });
};

describe("Tests API - GET /notifications/me", () => {
  test("Récupérer mes notifications retourne 200", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    await createNotification(user._id, {
      message: "Notification 1",
      type: "alert",
    });
    await createNotification(user._id, {
      message: "Notification 2",
      type: "alert",
    });

    const res = await request(app)
      .get("/notifications/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Liste de vos notifications");
    expect(res.body.data.notifications).toHaveLength(2);
  });

  test("Récupérer mes notifications sans authentification retourne 401", async () => {
    const res = await request(app).get("/notifications/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Récupérer mes notifications ne retourne pas les notifications d'autres utilisateurs", async () => {
    const { token: token1, user: user1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { user: user2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    await createNotification(user1._id, { message: "Pour user1" });
    await createNotification(user2._id, { message: "Pour user2" });

    const res = await request(app)
      .get("/notifications/me")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.data.notifications[0].message).toBe("Pour user1");
  });
});

describe("Tests API - GET /notifications/unread", () => {
  test("Récupérer mes notifications non lues retourne 200", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    await createNotification(user._id, {
      message: "Non lue",
      readAt: undefined,
    });
    await createNotification(user._id, {
      message: "Lue",
      readAt: new Date(),
    });

    const res = await request(app)
      .get("/notifications/unread")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.data.notifications[0].message).toBe("Non lue");
    expect(res.body.data.notifications[0].readAt).toBeNull();
  });

  test("Récupérer notifications non lues sans authentification retourne 401", async () => {
    const res = await request(app).get("/notifications/unread");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
  });
});

describe("Tests API - GET /notifications/unread/count", () => {
  test("Obtenir le nombre de notifications non lues retourne 200", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    await createNotification(user._id, { readAt: undefined });
    await createNotification(user._id, { readAt: undefined });
    await createNotification(user._id, { readAt: new Date() });

    const res = await request(app)
      .get("/notifications/unread/count")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.count).toBe(2);
  });

  test("Obtenir le count sans authentification retourne 401", async () => {
    const res = await request(app).get("/notifications/unread/count");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
  });
});

describe("Tests API - PATCH /notifications/:notificationId/read", () => {
  test("Marquer une notification comme lue retourne 200", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const notification = await createNotification(user._id, {
      readAt: undefined,
    });

    const res = await request(app)
      .patch(`/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Notification marquée comme lue");
    expect(res.body.data.notification.readAt).not.toBeNull();
  });

  test("Marquer comme lue sans authentification retourne 401", async () => {
    const res = await request(app).patch(
      "/notifications/123456789012345678901234/read",
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
  });

  test("Marquer comme lue une notification d'un autre utilisateur retourne 403", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { user: user2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    const notification = await createNotification(user2._id);

    const res = await request(app)
      .patch(`/notifications/${notification._id}/read`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Accès refusé à cette notification");
  });

  test("Marquer comme lue avec un ID invalide retourne 400", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/notifications/invalid-id/read")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Identifiant de notification invalide");
  });

  test("Marquer comme lue une notification inexistante retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/notifications/123456789012345678901234/read")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Notification non trouvée");
  });
});

describe("Tests API - PATCH /notifications/read-all", () => {
  test("Marquer toutes les notifications comme lues retourne 200", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    await createNotification(user._id, { readAt: undefined });
    await createNotification(user._id, { readAt: undefined });
    await createNotification(user._id, { readAt: undefined });

    const res = await request(app)
      .patch("/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe(
      "Toutes les notifications ont été marquées comme lues",
    );

    // Vérifier que toutes les notifications sont lues
    const countRes = await request(app)
      .get("/notifications/unread/count")
      .set("Authorization", `Bearer ${token}`);

    expect(countRes.body.data.count).toBe(0);
  });

  test("Marquer tout comme lu sans authentification retourne 401", async () => {
    const res = await request(app).patch("/notifications/read-all");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
  });
});

describe("Tests API - DELETE /notifications/:notificationId", () => {
  test("Supprimer une notification retourne 200", async () => {
    const { token, user } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const notification = await createNotification(user._id);

    const res = await request(app)
      .delete(`/notifications/${notification._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("Notification supprimée");

    // Vérifier que la notification est bien supprimée
    const getRes = await request(app)
      .get("/notifications/me")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.body.data.notifications).toHaveLength(0);
  });

  test("Supprimer sans authentification retourne 401", async () => {
    const res = await request(app).delete(
      "/notifications/123456789012345678901234",
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
  });

  test("Supprimer une notification d'un autre utilisateur retourne 403", async () => {
    const { token: token1 } = await createUserAndGetToken({
      username: "user1",
      email: "user1@example.com",
      password: "Password123!",
    });

    const { user: user2 } = await createUserAndGetToken({
      username: "user2",
      email: "user2@example.com",
      password: "Password123!",
    });

    const notification = await createNotification(user2._id);

    const res = await request(app)
      .delete(`/notifications/${notification._id}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Accès refusé à cette notification");
  });

  test("Supprimer une notification inexistante retourne 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .delete("/notifications/123456789012345678901234")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Notification non trouvée");
  });
});
