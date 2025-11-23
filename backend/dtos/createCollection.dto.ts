import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsArray,
} from "class-validator";

export class CreateCollectionDto {
  @IsNotEmpty({ message: "Le nom ne doit pas être vide." })
  @IsString({ message: "Le nom doit être une chaîne de caractères." })
  @Length(3, 50, { message: "Le nom doit contenir entre 3 et 50 caractères." })
  name!: string;

  @IsNotEmpty({ message: "Le type est requis." })
  @IsString({ message: "Le type doit être une chaîne de caractères." })
  @IsEnum(["book", "movie", "series", "music", "game", "other"], {
    message:
      "Le type doit être l'un des suivants: book, movie, series, music, game, other.",
  })
  type!: string;

  @IsOptional()
  @IsEnum(["public", "private", "shared"], {
    message: "La visibilité doit être 'public', 'private' ou 'shared'",
  })
  visibility?: "public" | "private" | "shared";

  @IsNotEmpty({ message: "L'identifiant utilisateur est requis." })
  @IsMongoId({
    message: "L'identifiant utilisateur doit être un ObjectId valide.",
  })
  authorId!: string;

  @IsOptional()
  @IsArray({ message: "works doit être un tableau" })
  @IsMongoId({
    each: true,
    message: "Chaque identifiant d'œuvre doit être un ObjectId valide.",
  })
  works?: string[];
}
