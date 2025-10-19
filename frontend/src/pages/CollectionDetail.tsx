import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collectionService } from "../services/collection.service";
import { workService } from "../services/work.service";
import { WorkCard } from "../components/WorkCard";
import { WorkSelector } from "../components/WorkSelector";
import type { Collection } from "../types/collection.types";
import type { Work } from "../types/work.types";

const TYPE_LABELS: Record<string, string> = {
  book: "Livres",
  movie: "Films",
  series: "Séries",
  music: "Musique",
  game: "Jeux vidéo",
  other: "Autre",
};

const VISIBILITY_LABELS: Record<string, { label: string; color: string }> = {
  private: { label: "Privée", color: "bg-[#33538A]" },
  public: { label: "Publique", color: "bg-[#4C8CBD]" },
  shared: { label: "Partagée", color: "bg-[#2BA84A]" },
};

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingWorks, setIsEditingWorks] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Refs pour le formulaire non contrôlé
  const nameInputRef = useRef<HTMLInputElement>(null);
  const visibilitySelectRef = useRef<HTMLSelectElement>(null);

  const loadCollectionAndWorks = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");

      // Charger la collection
      const collectionData = await collectionService.getCollectionById(id);
      setCollection(collectionData);

      // S'assurer que works est un tableau
      const workIds = collectionData.works || [];
      setSelectedWorkIds(workIds);

      // Charger toutes les œuvres et filtrer celles de la collection
      if (workIds.length > 0) {
        const allWorksResponse = await workService.getWorks({ limit: 100 });
        const collectionWorks = allWorksResponse.data.works.filter((work) =>
          workIds.includes(work._id),
        );
        setWorks(collectionWorks);
      } else {
        setWorks([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      navigate("/collections");
      return;
    }

    loadCollectionAndWorks();
  }, [id, navigate, loadCollectionAndWorks]);

  const handleSaveWorks = async () => {
    if (!collection || !id) return;

    try {
      setIsSaving(true);
      // Utiliser updateCollection pour remplacer complètement la liste des œuvres
      await collectionService.updateCollection(id, {
        works: selectedWorkIds,
      });
      setIsEditingWorks(false);
      await loadCollectionAndWorks();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection || !id) return;

    const name = nameInputRef.current?.value.trim() || "";
    const visibility = visibilitySelectRef.current?.value as
      | "private"
      | "public"
      | "shared";

    if (!name || name.length < 3) {
      alert("Le nom doit contenir au moins 3 caractères");
      return;
    }

    try {
      setIsSaving(true);
      await collectionService.updateCollection(id, {
        name,
        visibility,
      });
      setIsEditingInfo(false);
      await loadCollectionAndWorks();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditWorks = () => {
    setIsEditingWorks(false);
    if (collection) {
      setSelectedWorkIds(collection.works || []);
    }
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div
            className="text-slate-700 text-xl"
            role="status"
            aria-live="polite"
          >
            Chargement de la collection...
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="font-semibold" aria-hidden="true">
            ⚠{" "}
          </span>
          <span className="sr-only">Erreur : </span>
          {error || "Collection introuvable"}
        </div>
      </div>
    );
  }

  const visibilityInfo = VISIBILITY_LABELS[collection.visibility];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* En-tête de la collection */}
      <div className="mb-6">
        <div className="flex items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {collection.name}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2 py-0.5 bg-secondary-color text-slate-900 text-xs font-medium rounded">
                {TYPE_LABELS[collection.type]}
              </span>
              <span
                className={`inline-block px-2 py-0.5 ${visibilityInfo.color} text-slate-100 text-xs font-medium rounded`}
              >
                {visibilityInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des œuvres */}
      {works.length === 0 ? (
        <div className="bg-primary-color p-8 rounded-lg text-center flex">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Collection vide
          </h2>
          <p className="text-slate-700 text-sm">
            Cette collection ne contient aucune œuvre pour le moment.
          </p>
        </div>
      ) : (
        <>
          <div className="flex my-2 gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Œuvres ({works.length})
            </h2>
            <div className="flex ml-auto gap-2">
              <button
                onClick={() => setIsEditingInfo(true)}
                className="bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 whitespace-nowrap"
              >
                Modifier les informations
              </button>
              <button
                onClick={() => setIsEditingWorks(true)}
                className="bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 rounded text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 whitespace-nowrap"
              >
                Modifier les œuvres
              </button>
            </div>
          </div>

          {/* Formulaire d'édition des informations */}
          {isEditingInfo && (
            <div className="mb-4">
              <form onSubmit={handleSaveInfo} className="space-y-3">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-slate-900 font-medium mb-1 text-sm"
                  >
                    Nom de la collection
                  </label>
                  <input
                    type="text"
                    id="name"
                    ref={nameInputRef}
                    defaultValue={collection.name}
                    className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
                    placeholder="Nom de la collection"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label
                    htmlFor="visibility"
                    className="block text-slate-900 font-medium mb-1 text-sm"
                  >
                    Visibilité
                  </label>
                  <select
                    id="visibility"
                    ref={visibilitySelectRef}
                    defaultValue={collection.visibility}
                    className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
                    required
                    disabled={isSaving}
                  >
                    <option value="private">
                      Privée - Visible uniquement par vous
                    </option>
                    <option value="public">Publique - Visible par tous</option>
                    <option value="shared">
                      Partagée - Visible par les invités
                    </option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEditInfo}
                    disabled={isSaving}
                    className="bg-secondary-color hover:bg-primary-color text-slate-900 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                  >
                    {isSaving ? "Sauvegarde..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Formulaire d'édition des œuvres */}
          {isEditingWorks && (
            <div className="mb-4">
              <div className="space-y-3">
                <WorkSelector
                  collectionType={collection.type}
                  selectedWorkIds={selectedWorkIds}
                  onWorksChange={setSelectedWorkIds}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleCancelEditWorks}
                    disabled={isSaving}
                    className="bg-secondary-color hover:bg-primary-color text-slate-900 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveWorks}
                    disabled={isSaving}
                    className="bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                  >
                    {isSaving ? "Sauvegarde..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {works.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
