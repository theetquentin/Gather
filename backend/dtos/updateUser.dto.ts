import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class UpdateUserDto {
  @IsNotEmpty({ message: "Le mot de passe actuel est requis." })
  @IsString({
    message: "Le mot de passe actuel doit être une chaîne de caractères.",
  })
  currentPassword!: string;

  @IsOptional()
  @IsString({
    message: "Le nom d'utilisateur doit être une chaîne de caractères.",
  })
  @Length(3, 20, {
    message: "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.",
  })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: "Le format de l'adresse e-mail est invalide." })
  email?: string;

  @IsOptional()
  @IsString({
    message: "Le nouveau mot de passe doit être une chaîne de caractères.",
  })
  @Length(8, 30, {
    message: "Le nouveau mot de passe doit contenir entre 8 et 30 caractères.",
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        "Le nouveau mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.",
    },
  )
  newPassword?: string;

  @IsOptional()
  @IsString({
    message: "L'URL de la photo de profil doit être une chaîne de caractères.",
  })
  profilePicture?: string;
}
