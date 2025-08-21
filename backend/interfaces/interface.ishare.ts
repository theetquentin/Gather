import { Types } from "mongoose";

export interface IShare {
  collectionId: Types.ObjectId; // collection partagée
  guestId: Types.ObjectId; // utilisateur invité
  authorId: Types.ObjectId; // celui qui a envoyé l’invitation (peut ≠ owner)
  rights?: "read" | "edit";
  status?: "pending" | "refused" | "accepted";
  createdAt: Date;
  updatedAt: Date;
}
