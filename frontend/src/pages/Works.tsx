import { useState, useEffect } from 'react';
import { workService } from '../services/work.service';
import type { Work } from '../types/work.types';

export const Works = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await workService.getWorks();
        if (response.success) {
          setWorks(response.data.works);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false); // On arrête le chargement
      }
    };

    fetchWorks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-slate-500 text-xl">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Toutes les œuvres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {works.map((work) => (
          <div
            key={work._id}
            className="bg-primary-color hover:bg-secondary-color transition-colors rounded-lg shadow-sm overflow-hidden"
          >
            {work.images && work.images.length > 0 ? (
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={work.images[0]}
                  alt={`Couverture de ${work.title}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  {work.images.length > 1 && (
                    <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                      +{work.images.length - 1} image{work.images.length > 2 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Aucune image</span>
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
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Aucune œuvre trouvée
        </div>
      )}
    </div>
  );
};

