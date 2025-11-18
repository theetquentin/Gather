import { FiGithub, FiLinkedin } from "react-icons/fi";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-color mt-auto">
      <div className="max-w-sm mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-12">
          {/* Liens rapides */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-3">Liens rapides</h3>
            <nav aria-label="Liens de navigation du footer">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/works"
                    className="text-slate-700 hover:text-action-color transition-colors text-sm"
                  >
                    Œuvres
                  </Link>
                </li>
                <li>
                  <Link
                    to="/collections"
                    className="text-slate-700 hover:text-action-color transition-colors text-sm"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-collections"
                    className="text-slate-700 hover:text-action-color transition-colors text-sm"
                  >
                    Mes Collections
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Liens sociaux */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-3">Suivez-nous</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/theetquentin/Gather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 hover:text-action-color transition-colors p-2 rounded-lg hover:bg-primary-color focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                aria-label="GitHub du projet Gather"
              >
                <FiGithub className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/quentin-theet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 hover:text-action-color transition-colors p-2 rounded-lg hover:bg-primary-color focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
                aria-label="LinkedIn de Quentin Theet"
              >
                <FiLinkedin className="w-6 h-6" />
              </a>
            </div>
            <p className="text-slate-700 text-sm pt-7">© {currentYear} Gather</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
