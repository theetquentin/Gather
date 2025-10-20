import { useState, useEffect, useRef, useCallback } from 'react';
import { workService } from '../services/work.service';
import type { Work } from '../types/work.types';
import type { CollectionType } from '../types/collection.types';

interface WorkSelectorProps {
  collectionType: CollectionType;
  selectedWorkIds: string[];
  onWorksChange: (workIds: string[]) => void;
}

const TYPE_MAPPING: Record<CollectionType, string> = {
  book: 'book',
  movie: 'movie',
  series: 'series',
  music: 'music',
  game: 'game',
  other: 'other',
};

export const WorkSelector = ({ collectionType, selectedWorkIds, onWorksChange }: WorkSelectorProps) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimerRef = useRef<number | null>(null);

  // Charger les œuvres selon le type et la recherche
  const loadWorks = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      const workType = TYPE_MAPPING[collectionType];
      const response = await workService.getWorks({
        limit: 20,
        type: workType,
        search: search?.trim() || undefined,
      });
      setWorks(response.data.works);
    } catch (err) {
      console.error('Erreur lors du chargement des œuvres:', err);
      setWorks([]);
    } finally {
      setIsLoading(false);
    }
  }, [collectionType]);

  // Charger les œuvres quand le type change
  useEffect(() => {
    setSearchQuery(''); // Réinitialiser la recherche
    loadWorks();
  }, [collectionType, loadWorks]);

  // Debounce pour la recherche (attend 500ms après la dernière frappe)
  useEffect(() => {
    // Annuler le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si la recherche est vide, charger immédiatement
    if (!searchQuery.trim()) {
      loadWorks();
      return;
    }

    // Sinon, attendre 500ms avant de lancer la recherche
    debounceTimerRef.current = setTimeout(() => {
      loadWorks(searchQuery);
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, loadWorks]);

  const handleToggleWork = (workId: string) => {
    if (selectedWorkIds.includes(workId)) {
      onWorksChange(selectedWorkIds.filter(id => id !== workId));
    } else {
      onWorksChange([...selectedWorkIds, workId]);
    }
  };

  const handleSelectAll = () => {
    const allIds = works.map(work => work._id);
    onWorksChange(allIds);
  };

  const handleDeselectAll = () => {
    onWorksChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-slate-900 font-semibold">
          Ajouter des œuvres (optionnel)
        </label>
        {works.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-action-color hover:text-action-color-hover font-medium"
            >
              Tout sélectionner
            </button>
            {selectedWorkIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-sm text-slate-700 hover:text-slate-900 font-medium"
              >
                Tout désélectionner
              </button>
            )}
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par titre ou auteur..."
          className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-action-color border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Compteur de sélection */}
      {selectedWorkIds.length > 0 && (
        <div className="text-sm text-slate-700">
          <span className="font-medium">{selectedWorkIds.length}</span> œuvre{selectedWorkIds.length > 1 ? 's' : ''} sélectionnée{selectedWorkIds.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Liste des œuvres */}
      {works.length === 0 && !isLoading ? (
        <div className="bg-primary-color p-6 rounded-lg text-center text-slate-700">
          {searchQuery.trim()
            ? `Aucune œuvre trouvée pour "${searchQuery}"`
            : 'Aucune œuvre disponible pour ce type de collection'}
        </div>
      ) : (
        <div className="bg-primary-color rounded-lg border border-slate-400 max-h-64 overflow-y-auto">
          {works.map((work) => (
            <label
              key={work._id}
              htmlFor={`work-checkbox-${work._id}`}
              className={`flex items-start p-3 border-b border-slate-400 last:border-b-0 cursor-pointer hover:bg-secondary-color transition-colors ${
                selectedWorkIds.includes(work._id) ? 'bg-secondary-color' : ''
              }`}
            >
              <input
                type="checkbox"
                id={`work-checkbox-${work._id}`}
                checked={selectedWorkIds.includes(work._id)}
                onChange={() => handleToggleWork(work._id)}
                className="mt-1 mr-3 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                aria-label={`Sélectionner ${work.title} par ${work.author}`}
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">{work.title}</div>
                <div className="text-sm text-slate-700">{work.author}</div>
                {work.genre && work.genre.length > 0 && (
                  <div className="text-xs text-slate-600 mt-1">
                    {work.genre.join(', ')}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
