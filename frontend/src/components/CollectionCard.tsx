import { Link } from 'react-router-dom';
import type { Collection, CollectionType, CollectionVisibility } from '../types/collection.types';

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const TYPE_LABELS: Record<CollectionType, string> = {
  book: 'Livres',
  movie: 'Films',
  series: 'Séries',
  music: 'Musique',
  game: 'Jeux vidéo',
  other: 'Autre',
};

const VISIBILITY_LABELS: Record<CollectionVisibility, { label: string; color: string }> = {
  private: { label: 'Privée', color: 'bg-slate-500' },
  public: { label: 'Publique', color: 'bg-green-600' },
  shared: { label: 'Partagée', color: 'bg-blue-600' },
};

export const CollectionCard = ({ collection, onDelete, showActions = false }: CollectionCardProps) => {
  const visibilityInfo = VISIBILITY_LABELS[collection.visibility];

  return (
    <div className="bg-primary-color p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {collection.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1 bg-secondary-color text-slate-900 text-sm font-medium rounded-full">
              {TYPE_LABELS[collection.type]}
            </span>
            <span className={`inline-block px-3 py-1 ${visibilityInfo.color} text-slate-100 text-sm font-medium rounded-full`}>
              {visibilityInfo.label}
            </span>
          </div>
        </div>
      </div>

      <div className="text-slate-700 mb-4">
        <span className="font-medium">{collection.works.length}</span> œuvre{collection.works.length > 1 ? 's' : ''}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/collections/${collection._id}`}
          className="flex-1 text-center bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded-md font-medium transition-colors"
        >
          Voir la collection
        </Link>

        {showActions && onDelete && (
          <button
            onClick={() => onDelete(collection._id)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md font-medium transition-colors"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};
