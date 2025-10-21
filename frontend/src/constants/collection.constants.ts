import type { CollectionType, CollectionVisibility } from "../types/collection.types";

export const COLLECTION_TYPES: { value: CollectionType; label: string }[] = [
  { value: "book", label: "Livres" },
  { value: "movie", label: "Films" },
  { value: "series", label: "Séries" },
  { value: "music", label: "Musique" },
  { value: "game", label: "Jeux vidéo" },
  { value: "other", label: "Autre" },
];

export const VISIBILITY_LABELS: Record<string, { label: string; color: string }> = {
  private: { label: "Privée", color: "bg-[#33538A]" },
  public: { label: "Publique", color: "bg-[#4C8B3D]" },
  shared: { label: "Partagée", color: "bg-[#2BA84A]" },
};

export const VISIBILITY_OPTIONS: { value: CollectionVisibility; label: string; description: string }[] = [
  {
    value: "private",
    label: "Privée",
    description: "Visible uniquement par vous",
  },
  {
    value: "public",
    label: "Publique",
    description: "Visible par tous les utilisateurs",
  },
  {
    value: "shared",
    label: "Partagée",
    description: "Visible par les utilisateurs invités",
  },
];
