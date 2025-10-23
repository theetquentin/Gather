import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  return (
    <header className="bg-primary-color">
      <div className="max-w-6xl mx-auto py-4 px-4">
        <nav className="flex items-center justify-between min-h-[44px]" aria-label="Navigation principale">
          {/* Logo et liens - groupés à gauche */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-2xl font-bold text-slate-900 focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
              onClick={closeMobileMenu}
            >
              Gather
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex space-x-6">
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

              {!isAuthenticated && (
                <Link
                  to="/works"
                  className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
                >
                  Toutes les œuvres
                </Link>
              )}

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

              {isAuthenticated && user && ["admin", "moderator"].includes(user.role) && (
                <Link
                  to="/all-collections"
                  className="text-slate-900 hover:text-action-color-hover transition-colors font-medium focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2 rounded px-2"
                >
                  Toutes les collections
                </Link>
              )}
            </div>
          </div>

          {/* User actions - à droite */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-4">
              <NotificationBell />
              <span className="text-slate-700">
                Bonjour, <span className="font-medium text-slate-900">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded-md transition-colors font-medium"
                aria-label="Se déconnecter de votre compte"
              >
                Déconnexion
              </button>
            </div>
          )}

          {/* Mobile Menu Button & Notification Bell */}
          <div className="flex items-center space-x-3 lg:hidden">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-900 p-2 rounded-md hover:bg-secondary-color focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu - Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3 border-t border-slate-400 pt-4">
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="block text-slate-900 hover:text-action-color-hover transition-colors font-medium px-2 py-2 rounded hover:bg-secondary-color"
                  onClick={closeMobileMenu}
                >
                  Inscription
                </Link>
                <Link
                  to="/login"
                  className="block text-slate-900 hover:text-action-color-hover transition-colors font-medium px-2 py-2 rounded hover:bg-secondary-color"
                  onClick={closeMobileMenu}
                >
                  Connexion
                </Link>
                <Link
                  to="/works"
                  className="block text-slate-900 hover:text-action-color-hover transition-colors font-medium px-2 py-2 rounded hover:bg-secondary-color"
                  onClick={closeMobileMenu}
                >
                  Toutes les œuvres
                </Link>
              </>
            )}

            <Link
              to="/collections"
              className="block text-slate-900 hover:text-action-color-hover transition-colors font-medium px-2 py-2 rounded hover:bg-secondary-color"
              onClick={closeMobileMenu}
            >
              Collections publiques
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/my-collections"
                  className="block text-slate-900 hover:text-action-color-hover transition-colors font-medium px-2 py-2 rounded hover:bg-secondary-color"
                  onClick={closeMobileMenu}
                >
                  Mes collections
                </Link>

                {user && ["admin", "moderator"].includes(user.role) && (
                  <Link
                    to="/all-collections"
                    className="block text-slate-900 hover:text-action-color-hover transition-colors font-medium px-2 py-2 rounded hover:bg-secondary-color"
                    onClick={closeMobileMenu}
                  >
                    Toutes les collections
                  </Link>
                )}

                <div className="border-t border-slate-400 pt-3 mt-3">
                  <span className="block text-slate-700 px-2 py-2">
                    Bonjour, <span className="font-medium text-slate-900">{user?.username}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-action-color hover:bg-action-color-hover text-slate-100 px-4 py-2 rounded-md transition-colors font-medium mt-2"
                    aria-label="Se déconnecter de votre compte"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

