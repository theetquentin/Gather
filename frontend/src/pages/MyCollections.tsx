import { useState, useEffect, useCallback } from "react";
// import { FiSearch } from "react-icons/fi";
import { collectionService } from "../services/collection.service";
import { CollectionForm } from "../components/CollectionForm";
import { CollectionCard } from "../components/CollectionCard";
import { UserInvite } from "../components/UserInvite";
import type {
  Collection,
  CreateCollectionInput,
} from "../types/collection.types";

export const MyCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [newlyCreatedCollection, setNewlyCreatedCollection] =
    useState<Collection | null>(null);
  const [error, setError] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"owned" | "shared-with-me">("owned");

  const loadCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await collectionService.getUserCollections({ visibility: visibilityFilter });
      setCollections(data.collections);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des collections",
      );
    } finally {
      setIsLoading(false);
    }
  }, [visibilityFilter]);

  // Charger les collections au montage du composant et quand le filtre ou la fonction change
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleCreateCollection = async (data: CreateCollectionInput) => {
    setIsCreating(true);
    try {
      const newCollection = await collectionService.createCollection(data);
      setCollections([newCollection, ...collections]);
      setShowForm(false);

      // Si la collection est partagée, afficher l'interface d'invitation
      if (data.visibility === "shared") {
        setNewlyCreatedCollection(newCollection);
        setShowInvites(true);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseInvites = () => {
    setShowInvites(false);
    setNewlyCreatedCollection(null);
  };

  const handleDeleteCollection = async (id: string) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette collection ?")
    ) {
      return;
    }

    try {
      await collectionService.deleteCollection(id);
      setCollections(collections.filter((c) => c._id !== id));
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
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
    <main className="container mx-auto px-4 py-8 mt-6">
      {/* En-tête */}
      {/* Onglets de filtre */}
      <div className="flex gap-2 mb-8 border-b border-slate-400">
        <button
          onClick={() => setVisibilityFilter("owned")}
          className={`px-4 py-2 font-medium transition-colors ${
            visibilityFilter === "owned"
              ? "text-action-color border-b-2 border-action-color"
              : "text-slate-700 hover:text-slate-900 hover:border-b-2 hover:border-slate-400"
          }`}
        >
          Mes collections
        </button>
        <button
          onClick={() => setVisibilityFilter("shared-with-me")}
          className={`px-4 py-2 font-medium transition-colors ${
            visibilityFilter === "shared-with-me"
              ? "text-action-color border-b-2 border-action-color"
              : "text-slate-700 hover:text-slate-900 hover:border-b-2 hover:border-slate-400"
          }`}
        >
          Partagées avec moi
        </button>
      </div>

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
      {/* <div>
        <label className="block font-medium text-slate-900 mb-1">
          Recherche
        </label>
        <div className="relative">
          <label htmlFor="search">
            <FiSearch size={18} className="absolute top-3 left-3  " />
          </label>
          <input
            type="text"
            id="search"
            className="w-72 py-2 pl-11 pr-4 bg-primary-color text-slate-900 rounded-lg border border-slate-400"
            placeholder="Rechercher par titre ou utilisateur"
          />
        </div>
      </div> */}

      {/* Formulaire de création */}
      {showForm && (
        <div className="p-6 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Créer une nouvelle collection
          </h2>
          <CollectionForm
            onSubmit={handleCreateCollection}
            onCancel={() => setShowForm(false)}
            isLoading={isCreating}
          />
        </div>
      )}

      {/* Interface d'invitation après création */}
      {showInvites && newlyCreatedCollection && (
        <div className="bg-primary-color p-6 rounded-xl mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Collection créée avec succès !
            </h2>
            <p className="text-slate-700 mb-1">
              <span className="font-medium">{newlyCreatedCollection.name}</span>
            </p>
            <p className="text-slate-700 text-sm">
              Vous pouvez maintenant inviter des utilisateurs à cette
              collection.
            </p>
          </div>

          <UserInvite collectionId={newlyCreatedCollection._id} />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleCloseInvites}
              className="bg-action-color hover:bg-action-color-hover text-slate-100 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
      )}

      {/* Liste des collections */}
      {collections.length === 0 ? (
        <div className="p-12 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Aucune collection
          </h2>
          <p className="text-slate-700 mb-6">
            {visibilityFilter === "owned"
              ? "Vous n'avez pas encore créé de collection. Commencez dès maintenant !"
              : "Aucune collection n'a été partagée avec vous pour le moment."}
          </p>
          {!showForm && visibilityFilter === "owned" && (
            <button
              onClick={() => setShowForm(true)}
              className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-8 py-3 rounded-md font-medium transition-colors"
            >
              Créer ma première collection
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 text-slate-700 flex justify-between items-center">
            <div>
              <span className="font-medium">{collections.length}</span> collection
              {collections.length > 1 ? "s" : ""}
            </div>
            {visibilityFilter === "owned" && !showForm && !showInvites && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Créer une collection
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection._id}
                collection={collection}
                onDelete={handleDeleteCollection}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
