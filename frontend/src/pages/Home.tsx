import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SEO } from "../components/SEO";
import { StructuredData } from "../components/StructuredData";
import { organizationSchema, websiteSchema } from "../constants/seoSchemas";
import {
  IoFolderOutline,
  IoSearchOutline,
  IoShareSocialOutline,
  IoStarOutline,
} from "react-icons/io5";

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/works");
    }
  }, [isAuthenticated, navigate]);

  return (
    <main>
      <SEO
        title="Gather - Gérez vos collections personnelles"
        description="Organisez, partagez et explorez vos passions culturelles avec Gather. Créez vos collections de livres, films, séries, musique et jeux."
        keywords="collection, bibliothèque, films, livres, séries, musique, jeux, gestion, organisation, partage"
        ogType="website"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
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

      <div className="flex justify-center">
        <Link
          to="/register"
          className="inline-block bg-action-color hover:bg-action-color-hover text-slate-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
          aria-label="S'inscrire sur Gather"
        >
          Commencer maintenant
        </Link>
      </div>
    </main>
  );
};
