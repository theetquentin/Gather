import type { CollectionType } from "../types/collection.types";

/**
 * Types d'œuvres et de collections disponibles dans l'application
 */
export const TYPES: { value: CollectionType; label: string }[] = [
  { value: "book", label: "Livre" },
  { value: "movie", label: "Film" },
  { value: "series", label: "Série" },
  { value: "music", label: "Musique" },
  { value: "game", label: "Jeu" },
  { value: "other", label: "Autre" },
];

/**
 * Types avec option "Tous" pour les filtres
 */
export const TYPES_WITH_ALL = [
  { value: "", label: "Tous les types" },
  ...TYPES,
];
