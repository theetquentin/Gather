import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    // border-b-2 border-primary-color
    <header className="bg-primary-color">
      <div className="max-w-6xl mx-auto py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-slate-900">
              Gather
            </Link>
            
            <div className="flex space-x-6">
              {!isAuthenticated && (
                <>
                  <Link
                    to="/register"
                    className="text-slate-900 hover:text-action-color-hover transition-colors font-medium"
                  >
                    Inscription
                  </Link>
                  <Link
                    to="/login"
                    className="text-slate-900 hover:text-action-color-hover transition-colors font-medium"
                  >
                    Connexion
                  </Link>
                </>
              )}

              <Link
                to="/works"
                className="text-slate-900 hover:text-action-color-hover transition-colors font-medium"
              >
                Toutes les œuvres
              </Link>

              <Link
                to="/collections"
                className="text-slate-900 hover:text-action-color-hover transition-colors font-medium"
              >
                Collections publiques
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-collections"
                  className="text-slate-900 hover:text-action-color-hover transition-colors font-medium"
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
                className="bg-action-color hover:bg-secondary-color text-slate-100 px-4 py-2 rounded-md transition-colors font-medium"
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

