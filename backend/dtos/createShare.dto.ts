import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class CreateShareDto {
  @IsNotEmpty({ message: "L'identifiant de la collection est requis." })
  @IsMongoId({
    message: "L'identifiant de la collection doit être un ObjectId valide.",
  })
  collectionId!: string;

  @IsNotEmpty({ message: "L'identifiant de l'invité est requis." })
  @IsMongoId({
    message: "L'identifiant de l'invité doit être un ObjectId valide.",
  })
  guestId!: string;

  @IsNotEmpty({ message: "L'identifiant de l'auteur est requis." })
  @IsMongoId({
    message: "L'identifiant de l'auteur doit être un ObjectId valide.",
  })
  authorId!: string;

  @IsOptional()
  @IsEnum(["read", "edit"], {
    message: "Les droits doivent être 'read' ou 'edit'.",
  })
  rights?: "read" | "edit";
}
