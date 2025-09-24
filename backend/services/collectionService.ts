import {
  createCollection,
  countCollectionByNameByUser,
} from "../repositories/collectionRepository";
import { Types } from "mongoose";
import { ICollection } from "../interfaces/interface.icollection";
import { getUserById } from "../repositories/userRepository";
import { countWorksByIds } from "../repositories/workRepository";

export const createNewCollection = async (data: ICollection) => {
  const { name, works, userId } = data;

  const countCollection = await countCollectionByNameByUser(name, userId);

  if (countCollection > 0)
    throw new Error("Vous avez déjà nommé une de vos collections ainsi");

  const user = await getUserById(userId.toString());

  if (!user) throw new Error("Utilisateur non trouvé");

  // Déduplication des works si fournis
  const uniqueWorks = works
    ? Array.from(new Set(works.map((w) => w.toString()))).map(
        (id) => new Types.ObjectId(id),
      )
    : undefined;

  // Vérification de l'existence des works
  if (uniqueWorks && uniqueWorks.length > 0) {
    const count = await countWorksByIds(uniqueWorks);
    if (count !== uniqueWorks.length) {
      throw new Error("Certaines œuvres n'existent pas");
    }
  }

  return await createCollection({ ...data, works: uniqueWorks ?? undefined });
};
