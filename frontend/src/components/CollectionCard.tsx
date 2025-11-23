import { Link } from "react-router-dom";
import { VISIBILITY_CONFIG } from "../constants/collection.constants";
import { TYPES } from "../constants/types.constants";
import type { Collection } from "../types/collection.types";

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const CollectionCard = ({
  collection,
  onDelete,
  showActions = false,
}: CollectionCardProps) => {
  const visibilityInfo = VISIBILITY_CONFIG[collection.visibility];
  const isOwner = collection.owned !== false; // Par défaut true si non défini

  // Extraire les 3 premières images des œuvres
  const previewImages: string[] = [];
  for (const work of collection.works) {
    if (work.images && work.images.length > 0 && previewImages.length < 3) {
      previewImages.push(work.images[0]);
    }
    if (previewImages.length >= 3) break;
  }

  const worksCount = collection.works.length;

  return (
    <div className="bg-primary-color p-4 sm:p-6 rounded-xl shadow hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Miniature des images */}
      {previewImages.length > 0 && (
        <div className="mb-4 h-32 rounded-lg overflow-hidden flex items-center justify-center gap-1 p-1">
          {previewImages.map((image, index) => (
            <div
              key={index}
              className="relative bg-slate-200 overflow-hidden rounded flex-1 h-full"
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
              {collection.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-secondary-color text-slate-900 text-xs sm:text-sm font-medium rounded-full">
              {TYPES.find((t) => t.value === collection.type)?.label}
            </span>
            <span
              className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 ${visibilityInfo.color} ${visibilityInfo.text} text-xs sm:text-sm font-medium rounded-full`}
            >
              {visibilityInfo.label}
            </span>
            {!isOwner && collection.rights && (
              <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-600 text-slate-100 text-xs sm:text-sm font-medium rounded-full">
                {collection.rights === "read" ? "Lecture seule" : "Édition"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-slate-700 mb-4">
        <span className="font-medium">{worksCount}</span> œuvre
        {worksCount > 1 ? "s" : ""}
      </div>

      <div className="flex gap-2 mt-auto">
        <Link
          to={`/collections/${collection._id}`}
          className="flex-1 text-center bg-action-color hover:bg-action-color-hover text-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-colors focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
          aria-label={`Voir les détails de la collection ${collection.name}`}
        >
          Voir la collection
        </Link>

        {showActions && onDelete && isOwner && (
          <button
            onClick={() => onDelete(collection._id)}
            className="cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-slate-100 rounded-md text-sm sm:text-base font-medium transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label={`Supprimer la collection ${collection.name}`}
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};
