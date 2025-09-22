import request from "supertest";
import { app } from "../app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

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

    const res = await request(app).post("/api/users").send(userData);

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

    const res = await request(app).post("/api/users").send(userData);

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

    const res = await request(app).post("/api/users").send(userData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toContain(
      "Le format de l'adresse e-mail est invalide.",
    );
  });

  test("Quand le format du mdp (8 caractères minimum, 1 maj, 1 minuscule et 1 caractère spécial) n'est pas conforme, retourne une erreur 400", async () => {
    const userData = {
      username: "Test",
      email: "sameexample.com",
      password: "Password123",
    };

    const res = await request(app).post("/api/users").send(userData);

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

    await request(app).post("/api/users").send(userData);

    const res = await request(app).post("/api/users").send({
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

    await request(app).post("/api/users").send(userData);

    const res = await request(app).post("/api/users").send({
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
  test("On récupère plusieurs utilisateurs", async () => {
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

    await request(app).post("/api/users").send(user1);
    await request(app).post("/api/users").send(user2);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("List of all users");
    expect(res.body.data.users).toHaveLength(2);
    expect(res.body.data.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "user1" }),
        expect.objectContaining({ username: "user2" }),
      ]),
    );
  });

  test("Aucun utilisateur présent dans la bdd, retourne un tableau vide", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe("List of all users");
    expect(res.body.data.users).toHaveLength(0);
  });
});

describe("Tests API - GET /users/:userId", () => {
  test("Mauvaise id donné, on ne trouve pas l'utilisateur retourne une erreur 400", async () => {
    const res = await request(app).get("/api/users/123456789123456789231432");

    expect(res.status).toBe(404);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Utilisateur non trouvé");
  });

  test("Mauvais format donné, l'identifiant mongoose doit faire 24 caractères", async () => {
    const res = await request(app).get("/api/users/test");

    expect(res.status).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBe("Format de l'id invalide");
  });

  test("Test avec id correcte, retourne bien l'utilisateur", async () => {
    const data = {
      username: "user",
      email: "same@example.com",
      password: "Password123!",
    };

    await request(app).post("/api/users").send(data);

    const resUser = await request(app).get("/api/users");

    const userId = resUser.body.data.users[0]._id;

    const res = await request(app).get(`/api/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.message).toBe(`Here's the user for the id ${userId}`);
    expect(res.body.data.user).toHaveProperty("username", "user");
    expect(res.body.data.user).toHaveProperty("email", "same@example.com");
  });
});
