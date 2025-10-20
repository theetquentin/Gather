import { useState, useEffect } from "react";
import { workService } from "../services/work.service";
import { WorkCard } from "../components/WorkCard";
import type { Work } from "../types/work.types";

export const Works = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await workService.getWorks({ limit: 20 });
      setWorks(response.data.works);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">
        Toutes les œuvres
      </h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div
            className="text-slate-700 text-xl"
            role="status"
            aria-live="polite"
          >
            Chargement des œuvres...
          </div>
        </div>
      ) : error ? (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="font-semibold" aria-hidden="true">
            ⚠{" "}
          </span>
          <span className="sr-only">Erreur : </span>
          {error}
        </div>
      ) : (
        <>
          {works.length === 0 ? (
            <div className="bg-primary-color p-8 rounded-lg text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Aucune œuvre disponible
              </h2>
              <p className="text-slate-700 text-sm">
                Aucune œuvre n'est disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {works.map((work) => (
                <WorkCard key={work._id} work={work} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};

