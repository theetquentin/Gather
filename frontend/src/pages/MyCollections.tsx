import { useState, useEffect } from 'react';
import { collectionService } from '../services/collection.service';
import { CollectionForm } from '../components/CollectionForm';
import { CollectionCard } from '../components/CollectionCard';
import type { Collection, CreateCollectionInput } from '../types/collection.types';

export const MyCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Charger les collections au montage du composant
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await collectionService.getUserCollections();
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async (data: CreateCollectionInput) => {
    setIsCreating(true);
    try {
      const newCollection = await collectionService.createCollection(data);
      setCollections([newCollection, ...collections]);
      setShowForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) {
      return;
    }

    try {
      await collectionService.deleteCollection(id);
      setCollections(collections.filter(c => c._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-slate-700 text-xl" role="status" aria-live="polite">Chargement de vos collections...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Mes collections</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-action-color hover:bg-action-color-hover text-slate-100 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Créer une collection
          </button>
        )}
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <span className="font-semibold" aria-hidden="true">⚠ </span>
          <span className="sr-only">Erreur : </span>
          {error}
        </div>
      )}

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

      {/* Liste des collections */}
      {collections.length === 0 ? (
        <div className="bg-primary-color p-12 rounded-xl text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Aucune collection
          </h2>
          <p className="text-slate-700 mb-6">
            Vous n'avez pas encore créé de collection. Commencez dès maintenant !
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-action-color hover:bg-action-color-hover text-slate-100 px-8 py-3 rounded-md font-medium transition-colors"
            >
              Créer ma première collection
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-slate-700">
            <span className="font-medium">{collections.length}</span> collection{collections.length > 1 ? 's' : ''}
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
        </>
      )}
    </main>
  );
};
