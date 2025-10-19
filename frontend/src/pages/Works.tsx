import { useState, useEffect } from 'react';
import { workService } from '../services/work.service';
import { WorkCard } from '../components/WorkCard';
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
        <div className="text-slate-700 text-xl" role="status" aria-live="polite">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
        <span className="font-semibold" aria-hidden="true">⚠ </span>
        <span className="sr-only">Erreur : </span>
        {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Toutes les œuvres</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {works.map((work) => (
          <WorkCard key={work._id} work={work} />
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-12 text-slate-700">
          Aucune œuvre trouvée
        </div>
      )}
    </main>
  );
};

