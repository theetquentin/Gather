import { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import { workService } from "../services/work.service";
import { WorkCard } from "../components/WorkCard";
import { SEO } from "../components/SEO";
import { GenreSearchSelect } from "../components/GenreSearchSelect";
import { YearSearchSelect } from "../components/YearSearchSelect";
import { TypeSearchSelect } from "../components/TypeSearchSelect";
import { WORK_GENRES } from "../constants/work.constants";
import type { Work } from "../types/work.types";

export const Works = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  const debounceTimerRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  const loadWorks = useCallback(
    async (filters?: {
      search?: string;
      type?: string;
      genres?: string[];
      year?: string;
    }) => {
      try {
        setIsLoading(true);
        setError("");
        const response = await workService.getWorks({
          limit: 100,
          search: filters?.search?.trim() || undefined,
          type: filters?.type || undefined,
          genres:
            filters?.genres && filters.genres.length > 0
              ? filters.genres
              : undefined,
          year: filters?.year || undefined,
        });
        setWorks(response.data.works);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // Chargement immédiat au premier rendu
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadWorks({
        search: searchQuery,
        type: selectedType,
        genres: selectedGenres,
        year: selectedYear || undefined,
      });
      return;
    }

    // Debounce pour les changements ultérieurs
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadWorks({
        search: searchQuery,
        type: selectedType,
        genres: selectedGenres,
        year: selectedYear || undefined,
      });
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, selectedType, selectedGenres, selectedYear, loadWorks]);

  const handleAddGenre = (genre: string) => {
    if (genre && !selectedGenres.includes(genre)) {
      setSelectedGenres((prev) => [...prev, genre]);
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genre));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <SEO
        title="Toutes les œuvres - Gather"
        description="Découvrez toutes les œuvres disponibles sur Gather : livres, films, séries, musique, jeux et plus encore. Explorez et ajoutez à vos collections."
        keywords="œuvres, livres, films, séries, musique, jeux, catalogue, bibliothèque"
        ogType="website"
      />
      <h1 className="text-4xl font-bold text-slate-900 mb-6">
        Toutes les œuvres
      </h1>

      {/* Filtres de recherche */}
      <div className="mb-6 space-y-4">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-medium text-slate-900 mb-1">
              Recherche
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre ou auteur..."
                className="w-full h-10 pl-11 pr-4 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
                aria-label="Rechercher des œuvres"
              />
            </div>
          </div>
          <TypeSearchSelect
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />

          <GenreSearchSelect
            selectedGenres={selectedGenres}
            onAddGenre={handleAddGenre}
          />

          <YearSearchSelect
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
          />
        </div>

        {/* Tags des genres sélectionnés */}
        {selectedGenres.length > 0 && (
          <div>
            <label className="block font-medium text-slate-900 mb-2">
              Genres sélectionnés ({selectedGenres.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedGenres.map((genreValue) => {
                const genre = WORK_GENRES.find((g) => g.value === genreValue);
                return (
                  <button
                    key={genreValue}
                    onClick={() => handleRemoveGenre(genreValue)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-action-color text-slate-100 rounded-lg text-sm font-medium hover:bg-action-color-hover transition-colors"
                    aria-label={`Retirer ${genre?.label || genreValue}`}
                  >
                    {genre?.label || genreValue}
                    <FiX className="w-4 h-4" />
                  </button>
                );
              })}
              {/* Tag "Tout effacer" */}
              <button
                onClick={() => setSelectedGenres([])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-slate-100 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                aria-label="Tout effacer"
              >
                Tout effacer
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nombre de résultats */}
      {!isLoading && !error && (
        <div className="mb-4 text-slate-700">
          <span className="font-medium">{works.length}</span> œuvre
          {works.length > 1 ? "s" : ""} trouvée{works.length > 1 ? "s" : ""}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-action-color border-t-transparent rounded-full animate-spin" role="status" aria-label="Chargement des œuvres"></div>
        </div>
      ) : error ? (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="font-semibold" aria-hidden="true">
            ⚠{" "}
          </span>
          <span className="sr-only">Erreur : </span>
          {error}
        </div>
      ) : (
        <>
          {works.length === 0 ? (
            <div className="p-8 rounded-lg text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Aucune œuvre disponible
              </h2>
              <p className="text-slate-700">
                Aucune œuvre n'est disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {works.map((work) => (
                <WorkCard key={work._id} work={work} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};
