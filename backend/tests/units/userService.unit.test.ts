import {
  createNewUser,
  fetchUserById,
  searchUsersByQuery,
  hashPassword,
} from "../../services/userService";
import * as userRepository from "../../repositories/userRepository";
import * as argon2 from "argon2";
import { Types, Document } from "mongoose";

// Type helper for Mongoose documents
type MockDocument<T> = T & Document;

// Mock type for User
type MockUser = {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  role?: "admin" | "user" | "moderator";
  profilePicture?: string;
  collections?: Types.ObjectId[];
  shared?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};

// Mock des repositories
jest.mock("../../repositories/userRepository");
jest.mock("argon2");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe("userService - Tests unitaires", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewUser", () => {
    test("Devrait créer un utilisateur avec un mot de passe hashé", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      };

      const hashedPassword = "$argon2id$v=19$m=65536,t=3,p=4$hashedpwd";

      // Mock des appels
      mockUserRepository.countUsersByName.mockResolvedValue(0);
      mockUserRepository.countUsersByEmail.mockResolvedValue(0);
      mockArgon2.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.createUser.mockResolvedValue(
        // @ts-expect-error - Mock type intentionally differs from Mongoose document type
        {
          _id: new Types.ObjectId(),
          ...userData,
          password: hashedPassword,
          role: "user",
        } as unknown as MockDocument<MockUser>,
      );

      const result = await createNewUser(userData);

      // Vérifications
      expect(mockUserRepository.countUsersByName).toHaveBeenCalledWith(
        userData.username,
      );
      expect(mockUserRepository.countUsersByEmail).toHaveBeenCalledWith(
        userData.email,
      );
      expect(mockArgon2.hash).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      });
      expect(result.password).toBe(hashedPassword);
      expect(result.password).not.toBe(userData.password);
    });

    test("Devrait lever une erreur si le pseudo existe déjà", async () => {
      const userData = {
        username: "existinguser",
        email: "new@example.com",
        password: "Password123!",
      };

      mockUserRepository.countUsersByName.mockResolvedValue(1);
      mockUserRepository.countUsersByEmail.mockResolvedValue(0);

      await expect(createNewUser(userData)).rejects.toThrow(
        "Ce pseudonyme existe déjà",
      );

      // Les deux vérifications sont appelées, mais l'utilisateur n'est pas créé
      expect(mockUserRepository.countUsersByName).toHaveBeenCalledWith(
        userData.username,
      );
      expect(mockUserRepository.countUsersByEmail).toHaveBeenCalledWith(
        userData.email,
      );
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    test("Devrait lever une erreur si l'email existe déjà", async () => {
      const userData = {
        username: "newuser",
        email: "existing@example.com",
        password: "Password123!",
      };

      mockUserRepository.countUsersByName.mockResolvedValue(0);
      mockUserRepository.countUsersByEmail.mockResolvedValue(1);

      await expect(createNewUser(userData)).rejects.toThrow(
        "Ce mail est déjà attribué",
      );

      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });
  });

  describe("fetchUserById", () => {
    test("Devrait retourner un utilisateur valide", async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = {
        _id: new Types.ObjectId(userId),
        username: "testuser",
        email: "test@example.com",
        role: "user",
      };

      mockUserRepository.getUserById.mockResolvedValue(
        // @ts-expect-error - Mock type intentionally differs from Mongoose document type
        mockUser as unknown as MockDocument<MockUser>,
      );

      const result = await fetchUserById(userId);

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    test("Devrait lever une erreur si l'ID est manquant", async () => {
      await expect(fetchUserById("")).rejects.toThrow("Il manque l'id");

      expect(mockUserRepository.getUserById).not.toHaveBeenCalled();
    });

    test("Devrait lever une erreur si le format de l'ID est invalide", async () => {
      await expect(fetchUserById("invalid-id")).rejects.toThrow(
        "Format de l'id invalide",
      );

      expect(mockUserRepository.getUserById).not.toHaveBeenCalled();
    });

    test("Devrait lever une erreur si l'utilisateur n'existe pas", async () => {
      const userId = new Types.ObjectId().toString();
      mockUserRepository.getUserById.mockResolvedValue(null);

      await expect(fetchUserById(userId)).rejects.toThrow(
        "Utilisateur non trouvé",
      );
    });
  });

  describe("searchUsersByQuery", () => {
    test("Devrait retourner des utilisateurs correspondant à la recherche", async () => {
      const query = "test";
      const mockUsers = [
        {
          _id: new Types.ObjectId(),
          username: "testuser1",
          email: "test1@example.com",
        },
        {
          _id: new Types.ObjectId(),
          username: "testuser2",
          email: "test2@example.com",
        },
      ];

      mockUserRepository.searchUsers.mockResolvedValue(
        // @ts-expect-error - Mock type intentionally differs from Mongoose document type
        mockUsers as unknown as MockDocument<MockUser>[],
      );

      const result = await searchUsersByQuery(query);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockUsers);
    });

    test("Devrait ignorer les espaces au début et à la fin de la requête", async () => {
      const query = "  test  ";
      const trimmedQuery = "test";

      mockUserRepository.searchUsers.mockResolvedValue([]);

      await searchUsersByQuery(query);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(trimmedQuery);
    });

    test("Devrait lever une erreur si la requête est trop courte", async () => {
      await expect(searchUsersByQuery("a")).rejects.toThrow(
        "La recherche doit contenir entre 2 et 50 caractères",
      );

      expect(mockUserRepository.searchUsers).not.toHaveBeenCalled();
    });

    test("Devrait lever une erreur si la requête est trop longue", async () => {
      const longQuery = "a".repeat(51);

      await expect(searchUsersByQuery(longQuery)).rejects.toThrow(
        "La recherche doit contenir entre 2 et 50 caractères",
      );

      expect(mockUserRepository.searchUsers).not.toHaveBeenCalled();
    });

    test("Devrait gérer une requête vide ou avec seulement des espaces", async () => {
      await expect(searchUsersByQuery("   ")).rejects.toThrow(
        "La recherche doit contenir entre 2 et 50 caractères",
      );

      expect(mockUserRepository.searchUsers).not.toHaveBeenCalled();
    });
  });

  describe("hashPassword", () => {
    test("Devrait hasher un mot de passe valide", async () => {
      const password = "Password123!";
      const hashedPassword = "$argon2id$v=19$m=65536,t=3,p=4$hashedpwd";

      mockArgon2.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(mockArgon2.hash).toHaveBeenCalledWith(password);
      expect(result).toBe(hashedPassword);
    });

    test("Devrait lever une erreur si le mot de passe est un tableau", async () => {
      const invalidPassword = ["password1", "password2"] as unknown as string;

      await expect(hashPassword(invalidPassword)).rejects.toThrow(
        "Le mot de passe ne peut pas être un tableau.",
      );

      expect(mockArgon2.hash).not.toHaveBeenCalled();
    });

    test("Devrait gérer les erreurs de hachage", async () => {
      const password = "Password123!";
      const error = new Error("Argon2 error");

      mockArgon2.hash.mockRejectedValue(error);

      await expect(hashPassword(password)).rejects.toThrow(
        "Erreur lors du hachage du mot de passe : Argon2 error",
      );
    });

    test("Devrait gérer les erreurs inconnues lors du hachage", async () => {
      const password = "Password123!";

      mockArgon2.hash.mockRejectedValue("Unknown error");

      await expect(hashPassword(password)).rejects.toThrow(
        "Une erreur inconnue est survenue lors du hachage.",
      );
    });
  });
});
