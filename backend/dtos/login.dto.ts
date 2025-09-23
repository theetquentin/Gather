import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Email invalide" })
  email!: string;

  @IsString({ message: "Mot de passe requis" })
  @MinLength(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères",
  })
  password!: string;
}
