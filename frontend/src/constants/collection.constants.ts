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
  private: {
    label: "Privée",
    color: "bg-private-tag",
    text: "text-private-tag-txt",
  },
  public: {
    label: "Publique",
    color: "bg-public-tag",
    text: "text-public-tag-txt",
  },
  shared: {
    label: "Partagée",
    color: "bg-shared-tag",
    text: "text-shared-tag-txt",
  },
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
