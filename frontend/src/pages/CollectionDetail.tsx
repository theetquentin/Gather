import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionService } from '../services/collection.service';
import { workService } from '../services/work.service';
import { WorkCard } from '../components/WorkCard';
import { WorkSelector } from '../components/WorkSelector';
import type { Collection } from '../types/collection.types';
import type { Work } from '../types/work.types';

const TYPE_LABELS: Record<string, string> = {
  book: 'Livres',
  movie: 'Films',
  series: 'Séries',
  music: 'Musique',
  game: 'Jeux vidéo',
  other: 'Autre',
};

const VISIBILITY_LABELS: Record<string, { label: string; color: string }> = {
  private: { label: 'Privée', color: 'bg-slate-500' },
  public: { label: 'Publique', color: 'bg-green-600' },
  shared: { label: 'Partagée', color: 'bg-blue-600' },
};

export const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError('');

      // Charger la collection
      const collectionData = await collectionService.getCollectionById(id);
      setCollection(collectionData);

      // S'assurer que works est un tableau
      const workIds = collectionData.works || [];
      setSelectedWorkIds(workIds);

      // Charger toutes les œuvres et filtrer celles de la collection
      if (workIds.length > 0) {
        const allWorksResponse = await workService.getWorks({ limit: 100 });
        const collectionWorks = allWorksResponse.data.works.filter(work =>
          workIds.includes(work._id)
        );
        setWorks(collectionWorks);
      } else {
        setWorks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      navigate('/collections');
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
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection || !id) return;

    const name = nameInputRef.current?.value.trim() || '';
    const visibility = visibilitySelectRef.current?.value as 'private' | 'public' | 'shared';

    if (!name || name.length < 3) {
      alert('Le nom doit contenir au moins 3 caractères');
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
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
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
          <div className="text-slate-500 text-xl">Chargement de la collection...</div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Collection introuvable'}
        </div>
        <button
          onClick={() => navigate('/collections')}
          className="mt-4 text-action-color hover:text-action-color-hover font-medium"
        >
          ← Retour aux collections
        </button>
      </div>
    );
  }

  const visibilityInfo = VISIBILITY_LABELS[collection.visibility];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête de la collection */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-action-color hover:text-action-color-hover font-medium mb-4"
        >
          ← Retour
        </button>

        <div className="bg-primary-color p-6 rounded-xl shadow">
          {!isEditingInfo ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-slate-900">{collection.name}</h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="bg-secondary-color hover:bg-action-color hover:text-slate-100 text-slate-900 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Modifier infos
                  </button>
                  {!isEditingWorks && (
                    <button
                      onClick={() => setIsEditingWorks(true)}
                      className="bg-action-color hover:bg-action-color-hover text-slate-100 px-6 py-3 rounded-md font-medium transition-colors"
                    >
                      Modifier les œuvres
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-secondary-color text-slate-900 text-sm font-medium rounded-full">
                  {TYPE_LABELS[collection.type]}
                </span>
                <span className={`inline-block px-3 py-1 ${visibilityInfo.color} text-slate-100 text-sm font-medium rounded-full`}>
                  {visibilityInfo.label}
                </span>
              </div>

              <p className="text-slate-700">
                <span className="font-medium">{works.length}</span> œuvre{works.length > 1 ? 's' : ''} dans cette collection
              </p>
            </>
          ) : (
            <form onSubmit={handleSaveInfo}>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Modifier les informations</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="name" className="block text-slate-900 font-semibold mb-2">
                    Nom de la collection *
                  </label>
                  <input
                    type="text"
                    id="name"
                    ref={nameInputRef}
                    defaultValue={collection.name}
                    className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
                    disabled={isSaving}
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-slate-900 font-semibold mb-2">
                    Visibilité *
                  </label>
                  <select
                    id="visibility"
                    ref={visibilitySelectRef}
                    defaultValue={collection.visibility}
                    className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
                    disabled={isSaving}
                    required
                  >
                    <option value="private">Privée - Visible uniquement par vous</option>
                    <option value="public">Publique - Visible par tous les utilisateurs</option>
                    <option value="shared">Partagée - Visible par les utilisateurs invités</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note :</strong> Le type de collection ne peut pas être modifié pour éviter la perte des œuvres existantes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditInfo}
                  disabled={isSaving}
                  className="px-6 bg-secondary-color hover:bg-primary-color text-slate-900 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Mode édition des œuvres */}
      {isEditingWorks && (
        <div className="mb-8 bg-primary-color p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Modifier les œuvres de la collection</h2>

          <WorkSelector
            collectionType={collection.type}
            selectedWorkIds={selectedWorkIds}
            onWorksChange={setSelectedWorkIds}
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveWorks}
              disabled={isSaving}
              className="flex-1 bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
            <button
              onClick={handleCancelEditWorks}
              disabled={isSaving}
              className="px-6 bg-secondary-color hover:bg-primary-color text-slate-900 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des œuvres */}
      {works.length === 0 ? (
        <div className="bg-primary-color p-12 rounded-xl text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Collection vide
          </h2>
          <p className="text-slate-700">
            Cette collection ne contient aucune œuvre pour le moment.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Œuvres de la collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {works.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
