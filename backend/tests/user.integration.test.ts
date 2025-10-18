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

describe("Tests API - POST /users", () => {
  test("Quand le pseudo et l'email sont dispo, créer un utilisateur avec mdp hashé", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
    };

    const res = await request(app).post("/users").send(userData);

    expect(res.status).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("User created with success");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.username).toBe(userData.username);
    expect(res.body.data.email).toBe(userData.email);
    expect(res.body.data.password).not.toBe(userData.password);
  });

  test("Quand le pseudo n'est pas conforme entre 3-20 caractères, retourne une erreur 400", async () => {
    const userData = {
      username: "a",
      email: "same@example.com",
      password: "Password123!",
    };

    const res = await request(app).post("/users").send(userData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain(
      "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.",
    );
  });

  test("Quand le format de l'email n'est pas conforme, retourne une erreur 400", async () => {
    const userData = {
      username: "Test",
      email: "sameexample.com",
      password: "Password123!",
    };

    const res = await request(app).post("/users").send(userData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain(
      "Le format de l'adresse e-mail est invalide.",
    );
  });

  test("Quand le format du mdp (8 caractères minimum, 1 maj, 1 minuscule et 1 caractère spécial) n'est pas conforme, retourne une erreur 400", async () => {
    const userData = {
      username: "Test",
      email: "valid@example.com",
      password: "Password123",
    };

    const res = await request(app).post("/users").send(userData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain(
      "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.",
    );
  });

  test("Quand le pseudo existe déjà, retourne une erreur 400", async () => {
    const userData = {
      username: "user1",
      email: "same@example.com",
      password: "Password123!",
    };

    await request(app).post("/users").send(userData);

    const res = await request(app).post("/users").send({
      username: "user1",
      email: "same1@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Ce pseudonyme existe déjà");
  });

  test("Quand l'email existe déjà, retourne une erreur 400", async () => {
    const userData = {
      username: "user1",
      email: "same@example.com",
      password: "Password123!",
    };

    await request(app).post("/users").send(userData);

    const res = await request(app).post("/users").send({
      username: "user2",
      email: "same@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Ce mail est déjà attribué");
  });
});

describe("Tests API - GET /users", () => {
  test("On récupère plusieurs utilisateurs avec un token admin", async () => {
    const { token: adminToken } = await createUserAndGetToken({
      username: "admin",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
    });

    const user1 = {
      username: "user1",
      email: "same@example.com",
      password: "Password123!",
    };

    const user2 = {
      username: "user2",
      email: "same1@example.com",
      password: "Password123!",
    };

    await request(app).post("/users").send(user1);
    await request(app).post("/users").send(user2);

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("List of all users");
    expect(res.body.data.users).toHaveLength(3); // admin + user1 + user2
    expect(res.body.data.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "admin" }),
        expect.objectContaining({ username: "user1" }),
        expect.objectContaining({ username: "user2" }),
      ]),
    );
  });

  test("Aucun utilisateur présent dans la bdd sauf l'admin, retourne un tableau avec 1 utilisateur", async () => {
    const { token: adminToken } = await createUserAndGetToken({
      username: "admin",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
    });

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("List of all users");
    expect(res.body.data.users).toHaveLength(1);
  });

  test("Requête sans token d'authentification, retourne une erreur 401", async () => {
    const res = await request(app).get("/users");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });

  test("Requête avec un token de user simple (non admin/moderator), retourne une erreur 403", async () => {
    const { token: userToken } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
      role: "user",
    });

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Accès refusé");
  });
});

describe("Tests API - GET /users/:userId", () => {
  test("Mauvaise id donné, on ne trouve pas l'utilisateur retourne une erreur 404", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get("/users/123456789123456789231432")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Utilisateur non trouvé");
  });

  test("Mauvais format donné, l'identifiant mongoose doit faire 24 caractères", async () => {
    const { token } = await createUserAndGetToken({
      username: "user",
      email: "user@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get("/users/test")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Format de l'id invalide");
  });

  test("Test avec id correcte, retourne bien l'utilisateur", async () => {
    const { token: adminToken } = await createUserAndGetToken({
      username: "admin",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
    });

    const { user: createdUser } = await createUserAndGetToken({
      username: "user",
      email: "same@example.com",
      password: "Password123!",
    });

    const userId = createdUser.id;

    const res = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe(`Here's the user for the id ${userId}`);
    expect(res.body.data.user).toHaveProperty("username", "user");
    expect(res.body.data.user).toHaveProperty("email", "same@example.com");
  });

  test("Requête sans token d'authentification, retourne une erreur 401", async () => {
    const res = await request(app).get("/users/123456789123456789231432");

    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Token manquant");
  });
});
