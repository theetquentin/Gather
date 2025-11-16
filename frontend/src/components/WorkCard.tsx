import { FiPlus, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { Work } from "../types/work.types";

interface WorkCardProps {
  work: Work;
  onAddToCollection?: (work: Work) => void;
  onRemove?: (workId: string) => void;
  isAuthenticated?: boolean;
  width?: string;
}

export const WorkCard = ({ work, onAddToCollection, onRemove, isAuthenticated = false, width = "w-56" }: WorkCardProps) => {
  const navigate = useNavigate();

  const slugifyTitle = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .replace(/[^\w\s-]/g, "") // Supprime les caractères spéciaux
      .replace(/\s+/g, "-") // Remplace les espaces par des tirets
      .replace(/-+/g, "-") // Remplace plusieurs tirets par un seul
      .trim();
  };

  return (
    <div className={`group relative ${width} mb-4`}>
      {/* Bouton + pour ajouter à collection - seulement pour les utilisateurs connectés */}
      {isAuthenticated && onAddToCollection && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCollection(work);
          }}
          className="cursor-pointer absolute top-2 right-2 z-10 bg-action-color hover:bg-action-color-hover text-slate-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Ajouter à une collection"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      )}

      {/* Bouton X pour retirer de la collection */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(work._id);
          }}
          className="cursor-pointer absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-700 text-slate-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Retirer de la collection"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}

      {/* Zone cliquable */}
      <div
        onClick={() =>
          navigate(`/works/${work._id}/${slugifyTitle(work.title)}`)
        }
        className="cursor-pointer"
      >
        <div className="overflow-hidden rounded-lg aspect-[2/3]">
          {work.images && work.images.length > 0 ? (
            <img
              src={work.images[0]}
              alt={work.title}
              className="w-full h-full object-cover rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-12 h-12 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-action-color-hover line-clamp-2 transition-colors duration-200">
          {work.title}
        </h3>
      </div>
    </div>
  );
};
