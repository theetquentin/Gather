import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  IoFolderOutline,
  IoSearchOutline,
  IoShareSocialOutline,
  IoStarOutline,
} from "react-icons/io5";

export const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {!isAuthenticated && (
        <div className="max-w-4xl mx-auto">
          <section className="text-center pt-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Bienvenue sur Gather
            </h1>
            <p className="text-xl text-slate-500">
              Organisez, partagez et explorez vos passions culturelles avec
              Gather.
            </p>
          </section>

          {/* Grille des fonctionnalités principales */}
          <section className="grid grid-cols-2 gap-8 py-14">
            <div className="flex items-start gap-4">
              <IoFolderOutline className="w-10 h-10 text-action-color flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Organisez vos collections
                </h3>
                <p className="text-slate-500">
                  Créez et gérez vos collections personnalisées. Organisez vos
                  œuvres favorites par thème, genre ou humeur.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IoSearchOutline className="w-10 h-10 text-action-color flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Découvrez de nouvelles œuvres
                </h3>
                <p className="text-slate-500">
                  Explorez une vaste bibliothèque d'œuvres littéraires,
                  musicales et cinématographiques. Trouvez votre prochaine
                  découverte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IoShareSocialOutline className="w-10 h-10 text-action-color flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Partagez vos passions
                </h3>
                <p className="text-slate-500">
                  Partagez vos découvertes avec la communauté. Inspirez d'autres
                  passionnés et découvrez de nouvelles recommandations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <IoStarOutline className="w-10 h-10 text-action-color flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Évaluez des œuvres
                </h3>
                <p className="text-slate-500">
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
          className="inline-block bg-action-color hover:bg-action-color-hover text-slate-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
        >
          Commencer maintenant
        </Link>
      </div>
    </div>
  );
};
