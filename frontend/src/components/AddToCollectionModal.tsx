import { useState, useEffect } from "react";
import { FiX, FiPlus, FiCheck } from "react-icons/fi";
import { collectionService } from "../services/collection.service";
import type { Work } from "../types/work.types";
import type {
  Collection,
  CollectionType,
  CollectionVisibility,
} from "../types/collection.types";
import { TYPES } from "../constants/types.constants";
import { VISIBILITY_CONFIG } from "../constants/collection.constants";
interface AddToCollectionModalProps {
  work: Work | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddToCollectionModal = ({
  work,
  onClose,
  onSuccess,
}: AddToCollectionModalProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // État pour la création de nouvelle collection
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionType, setNewCollectionType] =
    useState<CollectionType>("other");
  const [newCollectionVisibility, setNewCollectionVisibility] =
    useState<CollectionVisibility>("private");

  useEffect(() => {
    if (work) {
      loadUserCollections();
    }
  }, [work]);

  const loadUserCollections = async () => {
    try {
      setIsLoading(true);
      const response = await collectionService.getUserCollections();
      setCollections(response.collections);
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

  const handleAddToCollection = async (collectionId: string) => {
    if (!work) return;

    try {
      setError("");
      setSuccess("");
      await collectionService.addWorksToCollection(collectionId, [work._id]);
      setSuccess("Œuvre ajoutée avec succès !");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout à la collection",
      );
    }
  };

  const handleCreateAndAdd = async () => {
    if (!work || !newCollectionName.trim()) {
      setError("Le nom de la collection est requis");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsLoading(true);

      // Créer la collection
      const newCollection = await collectionService.createCollection({
        name: newCollectionName.trim(),
        type: newCollectionType,
        visibility: newCollectionVisibility,
        works: [],
      });

      // Ajouter l'œuvre à la nouvelle collection
      await collectionService.addWorksToCollection(newCollection._id, [
        work._id,
      ]);

      setSuccess("Collection créée et œuvre ajoutée avec succès !");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la collection",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!work) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-page-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-page-background border-b border-slate-300 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Ajouter à une collection
          </h2>
          <button
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 transition-colors"
            aria-label="Fermer"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 p-3 bg-primary-color rounded-lg">
            <p className="text-sm text-slate-700">
              Œuvre sélectionnée :{" "}
              <span className="font-semibold text-slate-900">{work.title}</span>
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div
              className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2"
              role="alert"
            >
              <FiCheck className="w-5 h-5" />
              {success}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-action-color border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Liste des collections existantes */}
              {collections.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Choisir une collection existante
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {collections.map((collection) => (
                      <button
                        key={collection._id}
                        onClick={() => handleAddToCollection(collection._id)}
                        className="cursor-pointer w-full p-4 bg-primary-color hover:bg-secondary-color rounded-lg text-left transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {collection.name}
                          </p>
                          <p className="text-sm text-slate-700">
                            {
                              TYPES.find(
                                (type) => type.value === collection.type,
                              )?.label
                            }{" "}
                            • {collection.works.length} œuvre
                            {collection.works.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <FiPlus className="w-5 h-5 text-action-color group-hover:text-action-color-hover transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-6 bg-primary-color rounded-lg text-center">
                  <p className="text-slate-700">
                    Vous n'avez pas encore de collection.
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    Créez-en une ci-dessous pour ajouter cette œuvre.
                  </p>
                </div>
              )}

              {/* Formulaire de création */}
              <div className="border-t border-slate-300 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Créer une nouvelle collection
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="collection-name"
                      className="block text-sm font-medium text-slate-900 mb-1"
                    >
                      Nom de la collection
                    </label>
                    <input
                      id="collection-name"
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Ex: Mes films préférés"
                      className="w-full px-4 py-2 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="collection-type"
                      className="block text-sm font-medium text-slate-900 mb-1"
                    >
                      Type
                    </label>
                    <select
                      id="collection-type"
                      value={newCollectionType}
                      onChange={(e) =>
                        setNewCollectionType(e.target.value as CollectionType)
                      }
                      className="w-full px-4 py-2 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
                    >
                      {TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="collection-visibility"
                      className="block text-sm font-medium text-slate-900 mb-1"
                    >
                      Visibilité
                    </label>
                    <select
                      id="collection-visibility"
                      value={newCollectionVisibility}
                      onChange={(e) =>
                        setNewCollectionVisibility(
                          e.target.value as CollectionVisibility,
                        )
                      }
                      className="w-full px-4 py-2 bg-primary-color border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
                    >
                      {Object.values(VISIBILITY_CONFIG)
                        .filter((v) => v.value !== "shared")
                        .map((visibility) => (
                          <option key={visibility.value} value={visibility.value}>
                            {visibility.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCreateAndAdd}
                    disabled={isLoading || !newCollectionName.trim()}
                    className="w-full bg-action-color hover:bg-action-color-hover text-slate-100 font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-5 h-5" />
                        Créer et ajouter l'œuvre
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
