import { useState, useEffect } from "react";
import { collectionService } from "../services/collection.service";
import { CollectionCard } from "../components/CollectionCard";
import { SEO } from "../components/SEO";
import type { Collection } from "../types/collection.types";

export const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les collections au montage du composant
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await collectionService.getAllCollections(true); // Uniquement les collections publiques
      setCollections(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des collections",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <SEO
          title="Collections publiques - Gather"
          description="Parcourez les collections publiques partagées par la communauté Gather. Découvrez des collections de livres, films, séries, musique et jeux."
          keywords="collections, collections publiques, partage, communauté, bibliothèque partagée"
          ogType="website"
        />
        <div className="text-center py-12">
          <div
            className="text-slate-700 text-xl"
            role="status"
            aria-live="polite"
          >
            Chargement de vos collections...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <SEO
        title="Collections publiques - Gather"
        description="Parcourez les collections publiques partagées par la communauté Gather. Découvrez des collections de livres, films, séries, musique et jeux."
        keywords="collections, collections publiques, partage, communauté, bibliothèque partagée"
        ogType="website"
      />
      <h1 className="text-4xl font-bold text-slate-900 mb-8">
        Collections publiques
      </h1>

      {/* Message d'erreur global */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6"
          role="alert"
        >
          <span className="font-semibold" aria-hidden="true">
            ⚠{" "}
          </span>
          <span className="sr-only">Erreur : </span>
          {error}
        </div>
      )}

      {/* Liste des collections */}
      {collections.length === 0 ? (
        <div className="bg-primary-color p-12 rounded-xl text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Aucune collection publique
          </h2>
        </div>
      ) : (
        <>
          <div className="mb-4 text-slate-700">
            <span className="font-medium">{collections.length}</span> collection
            {collections.length > 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection._id}
                collection={collection}
                showActions={true}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
};
