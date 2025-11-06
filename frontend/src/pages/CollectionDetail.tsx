import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collectionService } from "../services/collection.service";
import { WorkCard } from "../components/WorkCard";
import { WorkSelector } from "../components/WorkSelector";
import { UserInvite } from "../components/UserInvite";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingMessage } from "../components/LoadingMessage";
import { SEO } from "../components/SEO";
import { StructuredData } from "../components/StructuredData";
import {
  createCollectionSchema,
  createBreadcrumbSchema,
} from "../constants/seoSchemas";
import { useAuth } from "../hooks/useAuth";
import {
  COLLECTION_TYPES,
  VISIBILITY_LABELS,
  VISIBILITY_OPTIONS,
} from "../constants/collection.constants";
import type {
  Collection,
  UpdateCollectionInput,
} from "../types/collection.types";

type EditMode = "info" | "works" | "invites" | null;

export const CollectionDetail = () => {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formVisibility, setFormVisibility] = useState<
    "private" | "public" | "shared"
  >("private");
  const [selectedWorkIds, setSelectedWorkIds] = useState<string[]>([]);

  const loadCollection = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError("");
      const data = await collectionService.getCollectionById(id);
      setCollection(data);
      setFormName(data.name);
      setFormVisibility(data.visibility);
      setSelectedWorkIds(data.works.map((w) => w._id));
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
    loadCollection();
  }, [id, navigate, loadCollection]);

  const handleSave = async (data: UpdateCollectionInput) => {
    if (!id) return;
    try {
      setIsSaving(true);
      setError("");
      await collectionService.updateCollection(id, data);
      await loadCollection();
      setEditMode(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim().length < 3) {
      setError("Le nom doit contenir au moins 3 caractères");
      return;
    }

    // Si la collection est actuellement partagée et qu'on change vers un autre type
    if (collection?.visibility === "shared" && formVisibility !== "shared") {
      const confirmed = window.confirm(
        "Attention : changer la visibilité de cette collection supprimera tous les partages existants et les invitations en attente. Voulez-vous continuer ?",
      );
      if (!confirmed) {
        return;
      }
    }

    handleSave({ name: formName.trim(), visibility: formVisibility });
  };

  const handleSaveWorks = () => handleSave({ works: selectedWorkIds });

  const handleCancelEdit = () => {
    if (collection) {
      setFormName(collection.name);
      setFormVisibility(collection.visibility);
      setSelectedWorkIds(collection.works.map((w) => w._id));
    }
    setEditMode(null);
    setError("");
  };

  if (isLoading)
    return <LoadingMessage message="Chargement de la collection..." />;
  if (!collection)
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Collection introuvable" />
      </div>
    );

  const visibilityInfo = VISIBILITY_LABELS[collection.visibility];
  const isOwner = collection.owned !== false;
  const canEdit = isOwner || collection.rights === "edit";

  // SEO dynamique basé sur la collection
  const collectionTypeLabel =
    COLLECTION_TYPES.find((t) => t.value === collection.type)?.label ||
    collection.type;
  const seoTitle = `${collection.name} - Collection ${collectionTypeLabel} - Gather`;
  const seoDescription = `Découvrez la collection "${collection.name}" sur Gather. ${collection.works.length} œuvre${collection.works.length > 1 ? "s" : ""} de type ${collectionTypeLabel}.`;
  const currentUrl = `${window.location.origin}/collections/${collection._id}`;

  // Structured data pour la collection
  const collectionSchema = createCollectionSchema({
    name: collection.name,
    type: collectionTypeLabel,
    url: currentUrl,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Accueil", url: window.location.origin },
    { name: "Collections", url: `${window.location.origin}/collections` },
    { name: collection.name, url: currentUrl },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`collection, ${collectionTypeLabel}, ${collection.name}`}
        ogType="article"
        canonical={currentUrl}
        noindex={collection.visibility === "private"}
      />
      <StructuredData data={collectionSchema} />
      <StructuredData data={breadcrumbSchema} />

      {error && <ErrorMessage message={error} className="mb-4" />}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {collection.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-secondary-color text-slate-900 text-xs font-medium rounded">
            {COLLECTION_TYPES.find((t) => t.value === collection.type)?.label}
          </span>
          <span
            className={`px-2 py-0.5 ${visibilityInfo.color} ${visibilityInfo.text} text-xs font-medium rounded`}
          >
            {visibilityInfo.label}
          </span>
          {!isOwner && collection.rights && (
            <span className="px-2 py-0.5 bg-slate-600 text-slate-100 text-xs font-medium rounded">
              {collection.rights === "read" ? "Lecture seule" : "Édition"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row my-4 gap-3 md:items-center">
        {collection.works.length > 0 && (
          <h2 className="text-lg font-semibold text-slate-900">
            Œuvres ({collection.works.length})
          </h2>
        )}
        {isAuthenticated && canEdit && (
          <div className="flex flex-col sm:flex-row md:ml-auto gap-2">
            {isOwner && (
              <button
                onClick={() => setEditMode("info")}
                className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap"
              >
                Modifier les informations
              </button>
            )}
            <button
              onClick={() => setEditMode("works")}
              className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap"
            >
              Modifier les œuvres
            </button>
            {isOwner && collection.visibility === "shared" && (
              <button
                onClick={() => setEditMode("invites")}
                className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap"
              >
                Gérer les invitations
              </button>
            )}
          </div>
        )}
      </div>

      {editMode === "info" && (
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
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
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
                value={formVisibility}
                onChange={(e) =>
                  setFormVisibility(
                    e.target.value as "private" | "public" | "shared",
                  )
                }
                className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
                required
                disabled={isSaving}
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="cursor-pointer bg-secondary-color hover:bg-primary-color text-slate-900 px-4 py-2 rounded text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded text-sm font-medium"
              >
                {isSaving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editMode === "works" && (
        <div className="mb-4">
          <WorkSelector
            collectionType={collection.type}
            selectedWorkIds={selectedWorkIds}
            onWorksChange={setSelectedWorkIds}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="cursor-pointer bg-secondary-color hover:bg-primary-color text-slate-900 px-4 py-2 rounded text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveWorks}
              disabled={isSaving}
              className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded text-sm font-medium"
            >
              {isSaving ? "Sauvegarde..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {editMode === "invites" && collection.visibility === "shared" && (
        <div className="mb-4">
          <UserInvite collectionId={collection._id} />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setEditMode(null)}
              className="cursor-pointer bg-secondary-color hover:bg-primary-color text-slate-900 px-4 py-2 rounded text-sm font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {collection.works.length === 0 ? (
        <div className="p-8 text-center mt-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Collection vide
          </h2>
          <p className="text-slate-700 text-sm">
            Cette collection ne contient aucune œuvre pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {collection.works.map((work) => (
            <WorkCard key={work._id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
};
