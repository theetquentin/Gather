import {
  createNewCollection,
  addWorksToCollection,
  fetchCollectionById,
  updateCollectionById,
  deleteCollectionById,
} from "../../services/collectionService";
import * as collectionRepository from "../../repositories/collectionRepository";
import * as userRepository from "../../repositories/userRepository";
import * as shareRepository from "../../repositories/shareRepository";
import * as notificationRepository from "../../repositories/notificationRepository";
import * as workService from "../../services/workService";
import { Types } from "mongoose";
import { IUser } from "../../interfaces/interface.iuser";
import { ICollection } from "../../interfaces/interface.icollection";
import { IShare } from "../../interfaces/interface.ishare";

// Types utilitaires pour extraire les types de retour des Promises
type RepositoryReturn<T> = T extends (...args: never[]) => Promise<infer R>
  ? R
  : never;

// Types des documents retournés par les repositories
type UserDoc = RepositoryReturn<typeof userRepository.getUserById>;
type CollectionDoc = RepositoryReturn<
  typeof collectionRepository.getCollectionById
>;
type ShareDoc = RepositoryReturn<
  typeof shareRepository.getAcceptedShareByCollectionAndGuest
>;
type ShareDocs = RepositoryReturn<
  typeof shareRepository.getSharesByCollectionId
>;
type DeleteResult = RepositoryReturn<
  typeof notificationRepository.deleteNotificationsByShareId
>;

// Type pour exclure null (utilisé pour mockResolvedValue qui ne peut pas recevoir null directement)
type NonNullable<T> = T extends null | undefined ? never : T;

// Types pour les mocks - on utilise Pick pour avoir un typage précis
type MockUser = Pick<IUser, "username" | "email" | "password"> & {
  _id: Types.ObjectId;
  __v?: number;
};

type MockCollection = Pick<ICollection, "name" | "type" | "userId"> & {
  _id: Types.ObjectId;
  visibility?: ICollection["visibility"];
  works?: Types.ObjectId[];
  __v?: number;
  toObject?: () => Record<string, unknown>;
};

type MockShare = Pick<
  IShare,
  "collectionId" | "authorId" | "rights" | "status"
> & {
  _id: Types.ObjectId;
  guestId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
};

// Helpers pour convertir les mocks en types repository
// On utilise `as never` car les mocks ne sont pas de vrais documents Mongoose
// Le type `never` peut être assigné à n'importe quel type, ce qui est parfait pour les tests
const toUserDoc = (mock: MockUser): NonNullable<UserDoc> => mock as never;
const toCollectionDoc = (mock: MockCollection): NonNullable<CollectionDoc> =>
  mock as never;
const toShareDoc = (mock: MockShare): NonNullable<ShareDoc> => mock as never;
const toShareDocs = (mocks: MockShare[]): ShareDocs => mocks as never;
const toDeleteResult = (): DeleteResult => ({}) as never;

// Mocks des repositories et services
jest.mock("../../repositories/collectionRepository");
jest.mock("../../repositories/userRepository");
jest.mock("../../repositories/shareRepository");
jest.mock("../../repositories/notificationRepository");
jest.mock("../../services/workService");

const mockCollectionRepository = collectionRepository as jest.Mocked<
  typeof collectionRepository
>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockShareRepository = shareRepository as jest.Mocked<
  typeof shareRepository
>;
const mockNotificationRepository = notificationRepository as jest.Mocked<
  typeof notificationRepository
>;
const mockWorkService = workService as jest.Mocked<typeof workService>;

describe("collectionService - Tests unitaires avec mocks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewCollection - Logique métier", () => {
    test("Devrait vérifier que le nom de collection n'existe pas déjà pour cet utilisateur", async () => {
      const userId = new Types.ObjectId();
      const collectionData: ICollection = {
        name: "Ma collection unique",
        type: "book",
        visibility: "public",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser: MockUser = {
        _id: userId,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpwd",
      };

      const mockCollectionResult: MockCollection = {
        _id: new Types.ObjectId(),
        name: collectionData.name,
        type: collectionData.type,
        visibility: collectionData.visibility,
        userId: collectionData.userId,
      };

      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(0);
      mockUserRepository.getUserById.mockResolvedValue(toUserDoc(mockUser));
      mockCollectionRepository.createCollection.mockResolvedValue(
        toCollectionDoc(mockCollectionResult),
      );

      await createNewCollection(collectionData);

      expect(
        mockCollectionRepository.countCollectionByNameByUser,
      ).toHaveBeenCalledWith(collectionData.name, userId);
    });

    test("Devrait rejeter si une collection avec le même nom existe déjà", async () => {
      const userId = new Types.ObjectId();
      const collectionData: ICollection = {
        name: "Collection existante",
        type: "movie",
        visibility: "private",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(1);

      await expect(createNewCollection(collectionData)).rejects.toThrow(
        "Vous avez déjà nommé une de vos collections ainsi",
      );

      expect(mockUserRepository.getUserById).not.toHaveBeenCalled();
      expect(mockCollectionRepository.createCollection).not.toHaveBeenCalled();
    });

    test("Devrait vérifier que l'utilisateur existe avant de créer la collection", async () => {
      const userId = new Types.ObjectId();
      const collectionData: ICollection = {
        name: "Nouvelle collection",
        type: "book",
        visibility: "public",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(0);
      mockUserRepository.getUserById.mockResolvedValue(null);

      await expect(createNewCollection(collectionData)).rejects.toThrow(
        "Utilisateur non trouvé",
      );

      expect(mockCollectionRepository.createCollection).not.toHaveBeenCalled();
    });

    test("Devrait dédupliquer les œuvres en entrée", async () => {
      const userId = new Types.ObjectId();
      const workId1 = new Types.ObjectId();
      const workId2 = new Types.ObjectId();

      const collectionData: ICollection = {
        name: "Collection avec doublons",
        type: "book",
        visibility: "public",
        userId,
        works: [workId1, workId2, workId1, workId2],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser: MockUser = {
        _id: userId,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpwd",
      };

      const mockCollectionResult: MockCollection = {
        _id: new Types.ObjectId(),
        name: collectionData.name,
        type: collectionData.type,
        visibility: collectionData.visibility,
        userId: collectionData.userId,
        works: [workId1, workId2],
      };

      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(0);
      mockUserRepository.getUserById.mockResolvedValue(toUserDoc(mockUser));
      mockWorkService.validateWorksExist.mockResolvedValue(undefined);
      mockWorkService.validateWorksType.mockResolvedValue([]);
      mockCollectionRepository.createCollection.mockResolvedValue(
        toCollectionDoc(mockCollectionResult),
      );

      await createNewCollection(collectionData);

      const createCall =
        mockCollectionRepository.createCollection.mock.calls[0][0];
      expect(createCall.works).toHaveLength(2);
    });

    test("Devrait valider que les œuvres existent avant de créer la collection", async () => {
      const userId = new Types.ObjectId();
      const workId = new Types.ObjectId();

      const collectionData: ICollection = {
        name: "Collection avec œuvres",
        type: "book",
        visibility: "public",
        userId,
        works: [workId],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser: MockUser = {
        _id: userId,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpwd",
      };

      const mockCollectionResult: MockCollection = {
        _id: new Types.ObjectId(),
        name: collectionData.name,
        type: collectionData.type,
        visibility: collectionData.visibility,
        userId: collectionData.userId,
      };

      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(0);
      mockUserRepository.getUserById.mockResolvedValue(toUserDoc(mockUser));
      mockWorkService.validateWorksExist.mockResolvedValue(undefined);
      mockWorkService.validateWorksType.mockResolvedValue([]);
      mockCollectionRepository.createCollection.mockResolvedValue(
        toCollectionDoc(mockCollectionResult),
      );

      await createNewCollection(collectionData);

      expect(mockWorkService.validateWorksExist).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Types.ObjectId)]),
      );
    });

    test("Devrait valider que les œuvres correspondent au type de collection", async () => {
      const userId = new Types.ObjectId();
      const workId = new Types.ObjectId();

      const collectionData: ICollection = {
        name: "Collection de livres",
        type: "book",
        visibility: "public",
        userId,
        works: [workId],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser: MockUser = {
        _id: userId,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpwd",
      };

      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(0);
      mockUserRepository.getUserById.mockResolvedValue(toUserDoc(mockUser));
      mockWorkService.validateWorksExist.mockResolvedValue(undefined);
      mockWorkService.validateWorksType.mockResolvedValue([workId.toString()]);

      await expect(createNewCollection(collectionData)).rejects.toThrow(
        /Les oeuvres ne sont pas du même type que la collection/,
      );

      expect(mockCollectionRepository.createCollection).not.toHaveBeenCalled();
    });
  });

  describe("fetchCollectionById - Logique de contrôle d'accès", () => {
    test("Une collection publique devrait être accessible sans authentification", async () => {
      const collectionId = new Types.ObjectId().toString();
      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection publique",
        type: "book",
        visibility: "public",
        userId: new Types.ObjectId(),
        toObject: jest.fn().mockReturnValue({
          _id: collectionId,
          name: "Collection publique",
          type: "book",
          visibility: "public",
        }),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );

      const result = await fetchCollectionById(collectionId);

      expect(mockCollectionRepository.getCollectionById).toHaveBeenCalledWith(
        collectionId,
      );
      expect(result).toHaveProperty("owned", false);
      expect(result.visibility).toBe("public");
    });

    test("Une collection privée devrait lever une erreur sans authentification", async () => {
      const collectionId = new Types.ObjectId().toString();
      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection privée",
        type: "book",
        visibility: "private",
        userId: new Types.ObjectId(),
        toObject: jest.fn(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );

      await expect(fetchCollectionById(collectionId)).rejects.toThrow(
        "Authentification requise pour accéder à cette collection",
      );
    });

    test("Le propriétaire devrait avoir owned=true sur sa collection publique", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();
      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Ma collection publique",
        type: "book",
        visibility: "public",
        userId,
        toObject: jest.fn().mockReturnValue({
          _id: collectionId,
          name: "Ma collection publique",
          type: "book",
          visibility: "public",
          userId,
        }),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );

      const result = await fetchCollectionById(collectionId, userId.toString());

      expect(result).toHaveProperty("owned", true);
    });

    test("Devrait vérifier les partages pour une collection privée si l'utilisateur n'est pas propriétaire", async () => {
      const userId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection privée",
        type: "book",
        visibility: "private",
        userId: ownerId,
        toObject: jest.fn(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );

      await expect(
        fetchCollectionById(collectionId, userId.toString()),
      ).rejects.toThrow("Accès refusé à cette collection");

      expect(
        mockShareRepository.getAcceptedShareByCollectionAndGuest,
      ).toHaveBeenCalledWith(
        new Types.ObjectId(collectionId),
        new Types.ObjectId(userId.toString()),
      );
    });

    test("Devrait retourner la collection avec les droits si un partage accepté existe", async () => {
      const userId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection partagée",
        type: "book",
        visibility: "shared",
        userId: ownerId,
        toObject: jest.fn().mockReturnValue({
          _id: collectionId,
          name: "Collection partagée",
          type: "book",
          visibility: "shared",
          userId: ownerId,
        }),
      };

      const mockShare: MockShare = {
        _id: new Types.ObjectId(),
        collectionId: new Types.ObjectId(collectionId),
        guestId: userId,
        authorId: ownerId,
        rights: "read",
        status: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        toShareDoc(mockShare),
      );

      const result = await fetchCollectionById(collectionId, userId.toString());

      expect(result).toHaveProperty("owned", false);
      expect(result).toHaveProperty("rights", "read");
      expect(result).toHaveProperty("authorId", ownerId);
    });
  });

  describe("updateCollectionById - Logique de permissions", () => {
    test("Le propriétaire devrait pouvoir modifier le nom", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Ancien nom",
        type: "book",
        visibility: "public",
        userId,
        toObject: jest.fn(),
      };

      const mockUpdatedCollection: MockCollection = {
        ...mockCollection,
        name: "Nouveau nom",
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );
      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(0);
      mockCollectionRepository.updateCollection.mockResolvedValue(
        toCollectionDoc(mockUpdatedCollection),
      );

      await updateCollectionById(collectionId, userId.toString(), {
        name: "Nouveau nom",
      });

      expect(mockCollectionRepository.updateCollection).toHaveBeenCalled();
    });

    test("Un utilisateur avec droits 'edit' ne devrait pas pouvoir modifier le nom", async () => {
      const userId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection",
        type: "book",
        visibility: "shared",
        userId: ownerId,
        toObject: jest.fn(),
      };

      const mockShare: MockShare = {
        _id: new Types.ObjectId(),
        collectionId: new Types.ObjectId(collectionId),
        guestId: userId,
        authorId: ownerId,
        rights: "edit",
        status: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        toShareDoc(mockShare),
      );

      await expect(
        updateCollectionById(collectionId, userId.toString(), {
          name: "Nouveau nom",
        }),
      ).rejects.toThrow(
        "Seul le propriétaire peut modifier les informations de la collection",
      );
    });

    test("Devrait vérifier qu'aucune autre collection avec le nouveau nom n'existe", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Ancien nom",
        type: "book",
        visibility: "public",
        userId,
        toObject: jest.fn(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );
      mockCollectionRepository.countCollectionByNameByUser.mockResolvedValue(1);

      await expect(
        updateCollectionById(collectionId, userId.toString(), {
          name: "Nom existant",
        }),
      ).rejects.toThrow("Vous avez déjà une collection avec ce nom");

      expect(mockCollectionRepository.updateCollection).not.toHaveBeenCalled();
    });

    test("Devrait supprimer les partages lors du passage de 'shared' à 'private'", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection",
        type: "book",
        visibility: "shared",
        userId,
        toObject: jest.fn(),
      };

      const mockShares: MockShare[] = [
        {
          _id: new Types.ObjectId(),
          collectionId: new Types.ObjectId(collectionId),
          guestId: new Types.ObjectId(),
          authorId: userId,
          rights: "read",
          status: "accepted",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          collectionId: new Types.ObjectId(collectionId),
          guestId: new Types.ObjectId(),
          authorId: userId,
          rights: "edit",
          status: "accepted",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );
      mockShareRepository.getSharesByCollectionId.mockResolvedValue(
        toShareDocs(mockShares),
      );
      mockNotificationRepository.deleteNotificationsByShareId.mockResolvedValue(
        toDeleteResult(),
      );
      mockShareRepository.deleteSharesByCollectionId.mockResolvedValue(
        toDeleteResult(),
      );
      mockCollectionRepository.updateCollection.mockResolvedValue(
        toCollectionDoc({
          ...mockCollection,
          visibility: "private",
        }),
      );

      await updateCollectionById(collectionId, userId.toString(), {
        visibility: "private",
      });

      expect(mockShareRepository.getSharesByCollectionId).toHaveBeenCalledWith(
        collectionId,
      );
      expect(
        mockNotificationRepository.deleteNotificationsByShareId,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockShareRepository.deleteSharesByCollectionId,
      ).toHaveBeenCalledWith(collectionId);
    });
  });

  describe("deleteCollectionById - Logique de permissions", () => {
    test("Seul le propriétaire devrait pouvoir supprimer la collection", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Ma collection",
        type: "book",
        visibility: "public",
        userId,
        toObject: jest.fn(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );
      mockCollectionRepository.deleteCollection.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );

      await deleteCollectionById(collectionId, userId.toString());

      expect(mockCollectionRepository.deleteCollection).toHaveBeenCalledWith(
        collectionId,
      );
    });

    test("Un utilisateur avec droits 'edit' ne devrait pas pouvoir supprimer", async () => {
      const userId = new Types.ObjectId();
      const ownerId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection",
        type: "book",
        visibility: "shared",
        userId: ownerId,
        toObject: jest.fn(),
      };

      const mockShare: MockShare = {
        _id: new Types.ObjectId(),
        collectionId: new Types.ObjectId(collectionId),
        guestId: userId,
        authorId: ownerId,
        rights: "edit",
        status: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        toShareDoc(mockShare),
      );

      await expect(
        deleteCollectionById(collectionId, userId.toString()),
      ).rejects.toThrow("Seul le propriétaire peut supprimer cette collection");

      expect(mockCollectionRepository.deleteCollection).not.toHaveBeenCalled();
    });
  });

  describe("addWorksToCollection - Validation des types", () => {
    test("Devrait filtrer les IDs invalides avant la validation", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();
      const validWorkId = new Types.ObjectId();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Ma collection",
        type: "book",
        visibility: "public",
        userId,
        toObject: jest.fn(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );
      mockWorkService.validateAndCategorizeWorks.mockResolvedValue({
        existingIds: new Set([validWorkId.toString()]),
        nonexistentIds: [],
        mismatchedIds: [],
      });
      mockCollectionRepository.addWorksToCollectionByIds.mockResolvedValue(
        toCollectionDoc({
          ...mockCollection,
          works: [validWorkId],
        }),
      );

      const result = await addWorksToCollection(
        collectionId,
        [validWorkId.toString(), "invalid-id", "another-bad-id"],
        userId.toString(),
      );

      expect(result.invalidIds).toContain("invalid-id");
      expect(result.invalidIds).toContain("another-bad-id");
    });

    test("Devrait rejeter si des œuvres ne correspondent pas au type de collection", async () => {
      const userId = new Types.ObjectId();
      const collectionId = new Types.ObjectId().toString();
      const workId = new Types.ObjectId();

      const mockCollection: MockCollection = {
        _id: new Types.ObjectId(collectionId),
        name: "Collection de livres",
        type: "book",
        visibility: "public",
        userId,
        toObject: jest.fn(),
      };

      mockCollectionRepository.getCollectionById.mockResolvedValue(
        toCollectionDoc(mockCollection),
      );
      mockShareRepository.getAcceptedShareByCollectionAndGuest.mockResolvedValue(
        null,
      );
      mockWorkService.validateAndCategorizeWorks.mockResolvedValue({
        existingIds: new Set([workId.toString()]),
        nonexistentIds: [],
        mismatchedIds: [workId.toString()],
      });

      await expect(
        addWorksToCollection(
          collectionId,
          [workId.toString()],
          userId.toString(),
        ),
      ).rejects.toThrow(
        /Les oeuvres ne sont pas du même type que la collection/,
      );
    });
  });
});
