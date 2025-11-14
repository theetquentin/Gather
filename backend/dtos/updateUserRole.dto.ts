import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateUserRoleDto {
  @IsNotEmpty({ message: "Le rôle ne doit pas être vide." })
  @IsEnum(["admin", "user", "moderator"], {
    message: "Le rôle doit être 'admin', 'user' ou 'moderator'.",
  })
  role!: "admin" | "user" | "moderator";
}
