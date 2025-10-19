import type { Work } from '../types/work.types';

interface WorkCardProps {
  work: Work;
}

export const WorkCard = ({ work }: WorkCardProps) => {
  return (
    <div className="bg-primary-color hover:bg-secondary-color transition-all duration-200 rounded-xl shadow-md hover:shadow-xl overflow-hidden group">
      {work.images && work.images.length > 0 ? (
        <div className="relative w-full h-64 overflow-hidden bg-slate-100">
          <img
            src={work.images[0]}
            alt={`Couverture de ${work.title}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute top-3 right-3">
            {work.images.length > 1 && (
              <span className="bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                +{work.images.length - 1} image{work.images.length > 2 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-slate-500 text-sm font-medium">Aucune image</span>
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{work.title}</h3>
        <p className="text-slate-700 mb-2">Par {work.author}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {work.genre.map((g, idx) => (
            <span
              key={idx}
              className="bg-action-color text-slate-100 text-xs px-2 py-1 rounded"
            >
              {g}
            </span>
          ))}
        </div>
        <p className="text-slate-700 text-sm">
          Type: <span className="font-medium">{work.type}</span>
        </p>
        <p className="text-slate-700 text-sm">
          Publié: {new Date(work.publishedAt).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};
