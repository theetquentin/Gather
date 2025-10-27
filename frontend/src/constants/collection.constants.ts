import type {
  CollectionType,
  CollectionVisibility,
} from "../types/collection.types";

export const COLLECTION_TYPES: { value: CollectionType; label: string }[] = [
  { value: "book", label: "Livres" },
  { value: "movie", label: "Films" },
  { value: "series", label: "Séries" },
  { value: "music", label: "Musique" },
  { value: "game", label: "Jeux vidéo" },
  { value: "other", label: "Autre" },
];

export const VISIBILITY_LABELS: Record<
  string,
  { label: string; color: string; text: string }
> = {
  private: { label: "Privée", color: "bg-[#B9EBC6]", text: "text-[#145214]" },
  public: { label: "Publique", color: "bg-[#F9E1B6]", text: "text-[#703E00]" },
  shared: { label: "Partagée", color: "bg-[#E1B9C6]", text: "text-[#4B1021]" },
};

export const VISIBILITY_OPTIONS: {
  value: CollectionVisibility;
  label: string;
  description: string;
}[] = [
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
