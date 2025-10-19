import { useState, useEffect } from 'react';
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
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger toutes les œuvres au montage
  useEffect(() => {
    loadWorks();
  }, []);

  // Filtrer les œuvres par type de collection
  useEffect(() => {
    const workType = TYPE_MAPPING[collectionType];
    let filtered = works.filter(work => work.type === workType);

    // Filtrer par recherche si une query existe
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        work =>
          work.title.toLowerCase().includes(query) ||
          work.author.toLowerCase().includes(query)
      );
    }

    setFilteredWorks(filtered);
  }, [works, collectionType, searchQuery]);

  const loadWorks = async () => {
    try {
      setIsLoading(true);
      const response = await workService.getWorks();
      setWorks(response.data.works);
    } catch (err) {
      console.error('Erreur lors du chargement des œuvres:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWork = (workId: string) => {
    if (selectedWorkIds.includes(workId)) {
      onWorksChange(selectedWorkIds.filter(id => id !== workId));
    } else {
      onWorksChange([...selectedWorkIds, workId]);
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredWorks.map(work => work._id);
    onWorksChange(allIds);
  };

  const handleDeselectAll = () => {
    onWorksChange([]);
  };

  if (isLoading) {
    return (
      <div className="text-slate-700 text-center py-4">
        Chargement des œuvres...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-slate-900 font-semibold">
          Ajouter des œuvres (optionnel)
        </label>
        {filteredWorks.length > 0 && (
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
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher par titre ou auteur..."
        className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900"
      />

      {/* Compteur de sélection */}
      {selectedWorkIds.length > 0 && (
        <div className="text-sm text-slate-700">
          <span className="font-medium">{selectedWorkIds.length}</span> œuvre{selectedWorkIds.length > 1 ? 's' : ''} sélectionnée{selectedWorkIds.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Liste des œuvres */}
      {filteredWorks.length === 0 ? (
        <div className="bg-primary-color p-6 rounded-lg text-center text-slate-700">
          Aucune œuvre disponible pour ce type de collection
        </div>
      ) : (
        <div className="bg-primary-color rounded-lg border border-slate-400 max-h-64 overflow-y-auto">
          {filteredWorks.map((work) => (
            <label
              key={work._id}
              className={`flex items-start p-3 border-b border-slate-300 last:border-b-0 cursor-pointer hover:bg-secondary-color transition-colors ${
                selectedWorkIds.includes(work._id) ? 'bg-secondary-color' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedWorkIds.includes(work._id)}
                onChange={() => handleToggleWork(work._id)}
                className="mt-1 mr-3"
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
