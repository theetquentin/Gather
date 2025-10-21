import { Types } from "mongoose";

export interface INotification {
  userId: Types.ObjectId; // utilisateur destinataire
  senderId?: Types.ObjectId; // optionnel : auteur de l'action (invitation, évaluation…)
  collectionId?: Types.ObjectId; // si lié à une collection
  workId?: Types.ObjectId; // si lié à une œuvre
  shareId?: Types.ObjectId; // si lié à une invitation de partage
  type: "review" | "share" | "alert";
  message: string;
  readAt?: Date; // null → non lu
  createdAt: Date;
  updatedAt: Date;
}
