import type { CollectionType } from "../types/collection.types";

export const TYPE_MAPPING: Record<CollectionType, string> = {
  book: "book",
  movie: "movie",
  series: "series",
  music: "music",
  game: "game",
  other: "other",
};

export const WORK_TYPES = [
  { value: "", label: "Tous les types" },
  { value: "book", label: "Livre" },
  { value: "movie", label: "Film" },
  { value: "series", label: "Série" },
  { value: "music", label: "Musique" },
  { value: "game", label: "Jeu" },
  { value: "other", label: "Autre" },
];

export const WORK_GENRES = [
  { value: "", label: "Tous les genres" },
  // Genres Films/Livres
  { value: "Action", label: "Action" },
  { value: "Aventure", label: "Aventure" },
  { value: "Animation", label: "Animation" },
  { value: "Biographie", label: "Biographie" },
  { value: "Comédie", label: "Comédie" },
  { value: "Crime", label: "Crime" },
  { value: "Drame", label: "Drame" },
  { value: "Fantastique", label: "Fantastique" },
  { value: "Historique", label: "Historique" },
  { value: "Horreur", label: "Horreur" },
  { value: "Mystère", label: "Mystère" },
  { value: "Philosophie", label: "Philosophie" },
  { value: "Romance", label: "Romance" },
  { value: "Science-Fiction", label: "Science-Fiction" },
  { value: "Thriller", label: "Thriller" },
  // Genres Musique
  { value: "Pop", label: "Pop" },
  { value: "Rock", label: "Rock" },
  { value: "Rock Alternatif", label: "Rock Alternatif" },
  { value: "Hard Rock / Metal", label: "Hard Rock / Metal" },
  { value: "Hip Hop / Soul", label: "Hip Hop / Soul" },
  { value: "Jazz / Electro", label: "Jazz / Electro" },
  { value: "Musique Classique", label: "Musique Classique" },
];

export const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "", label: "Toutes les années" }];
  for (let year = currentYear; year >= 1900; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};
