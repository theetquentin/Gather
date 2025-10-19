import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    // border-b-2 border-primary-color
    <header className="bg-primary-color">
      <div className="max-w-6xl mx-auto py-4">
        <nav className="flex items-center justify-between" aria-label="Navigation principale">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-slate-900 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2">
              Gather
            </Link>

            <div className="flex space-x-6">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/register"
                    className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
                  >
                    Inscription
                  </Link>
                  <Link
                    to="/login"
                    className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
                  >
                    Connexion
                  </Link>
                </>
              )}

              <Link
                to="/works"
                className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
              >
                Toutes les œuvres
              </Link>

              <Link
                to="/collections"
                className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
              >
                Collections publiques
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-collections"
                  className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
                >
                  Mes collections
                </Link>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-slate-700">
                Bonjour, <span className="font-medium text-slate-900">{user?.username}</span>
              </span>
              <button
                onClick={logout}
                className="bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded-md transition-colors font-medium"
                aria-label="Se déconnecter de votre compte"
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

