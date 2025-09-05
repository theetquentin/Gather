import request from "supertest";
import { app } from "../app";
import { connectDB, disconnectDB, clearDB } from "../config/database"; // fonctions utilitaires pour la DB
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  await connectDB(process.env.MONGO_TEST_URI);
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("POST /users - intégration", () => {
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
    expect(res.body.message).toBe("Ce pseudonyme existe déjà");
  });

  test("Quand le l'email existe déjà, retourne une erreur 400", async () => {
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
    expect(res.body.message).toBe("Ce mail est déjà attribué");
  });
});
