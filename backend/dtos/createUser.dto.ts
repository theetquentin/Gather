import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Le nom d'utilisateur ne doit pas être vide." })
  @IsString({
    message: "Le nom d'utilisateur doit être une chaîne de caractères.",
  })
  @Length(3, 20, {
    message: "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.",
  })
  username: string;

  @IsNotEmpty({ message: "L'adresse e-mail ne doit pas être vide." })
  @IsEmail({}, { message: "Le format de l'adresse e-mail est invalide." })
  email: string;

  @IsNotEmpty({ message: "Le mot de passe ne doit pas être vide." })
  @IsString({ message: "Le mot de passe doit être une chaîne de caractères." })
  @Length(8, 30, {
    message: "Le mot de passe doit contenir entre 8 et 30 caractères.",
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.",
    },
  )
  password: string;

  constructor(username: string, email: string, password: string) {
    this.username = username;
    this.email = email;
    this.password = password;
  }
}
