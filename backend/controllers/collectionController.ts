import { Request, Response } from "express";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { CreateCollectionDto } from "../dtos/createCollection.dto";
import { ICollection } from "../interfaces/interface.icollection";
import { createNewCollection } from "../services/collectionService";

export const createCollection = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(CreateCollectionDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const firstError = errors[0];
      const firstMessage = firstError.constraints
        ? Object.values(firstError.constraints)[0]
        : "Données invalides";
      return res
        .status(400)
        .json({ success: false, errors: firstMessage, data: null });
    }

    const collectionObject = instanceToPlain(dto) as unknown as ICollection;
    const result = await createNewCollection(collectionObject);

    return res.status(201).json({
      success: true,
      message: "Collection créée avec succès",
      data: {
        id: result._id,
        name: result.name,
        type: result.type,
        visibility: result.visibility,
        userId: result.userId,
        works: result.works,
      },
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Une erreur serveur est survenue";
    const isClientError = [
      "Vous avez déjà nommé une de vos collections ainsi",
      "Utilisateur non trouvé",
      "Certaines œuvres n'existent pas",
    ].includes(msg);
    return res
      .status(isClientError ? 400 : 500)
      .json({ success: false, errors: msg, data: null });
  }
};
