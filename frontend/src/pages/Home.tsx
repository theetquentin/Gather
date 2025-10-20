import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { workService } from "../services/work.service";
import { WorkCard } from "../components/WorkCard";
import type { Work } from "../types/work.types";
import {
  IoFolderOutline,
  IoSearchOutline,
  IoShareSocialOutline,
  IoStarOutline,
} from "react-icons/io5";

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      loadWorks();
    }
  }, [isAuthenticated]);

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
    <main>
      {!isAuthenticated && (
        <div className="max-w-4xl mx-auto">
          <section
            className="text-center pt-16"
            aria-labelledby="welcome-heading"
          >
            <h1
              id="welcome-heading"
              className="text-5xl font-bold text-slate-900 mb-4"
            >
              Bienvenue sur Gather
            </h1>
            <p className="text-xl text-slate-700">
              Organisez, partagez et explorez vos passions culturelles avec
              Gather.
            </p>
          </section>

          {/* Grille des fonctionnalités principales */}
          <section
            className="grid grid-cols-2 gap-8 py-14"
            aria-label="Fonctionnalités principales"
          >
            <div className="flex items-start gap-4">
              <IoFolderOutline
                className="w-10 h-10 text-action-color flex-shrink-0 mt-1"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Organisez vos collections
                </h3>
                <p className="text-slate-700">
                  Créez et gérez vos collections personnalisées. Organisez vos
                  œuvres favorites par thème, genre ou humeur.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IoSearchOutline
                className="w-10 h-10 text-action-color flex-shrink-0 mt-1"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Découvrez de nouvelles œuvres
                </h3>
                <p className="text-slate-700">
                  Explorez une vaste bibliothèque d'œuvres littéraires,
                  musicales et cinématographiques. Trouvez votre prochaine
                  découverte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IoShareSocialOutline
                className="w-10 h-10 text-action-color flex-shrink-0 mt-1"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Partagez vos passions
                </h3>
                <p className="text-slate-700">
                  Partagez vos découvertes avec la communauté. Inspirez d'autres
                  passionnés et découvrez de nouvelles recommandations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IoStarOutline
                className="w-10 h-10 text-action-color flex-shrink-0 mt-1"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Évaluez des œuvres
                </h3>
                <p className="text-slate-700">
                  Donnez votre avis et découvrez les recommandations. Aidez la
                  communauté à découvrir les meilleures œuvres.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {!isAuthenticated && (
        <div className="flex justify-center">
          <Link
            to="/register"
            className="inline-block bg-action-color hover:bg-action-color-hover text-slate-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
            aria-label="S'inscrire sur Gather"
          >
            Commencer maintenant
          </Link>
        </div>
      )}

      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 py-6">
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
        </div>
      )}
    </main>
  );
};
