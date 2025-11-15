import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiUser, FiShield, FiLogOut } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/profile/edit");
  };

  const handleRoleClick = () => {
    setIsOpen(false);
    navigate("/admin/roles");
  };

  if (!user) return null;

  // Obtenir la première lettre du username en majuscule
  const initial = user.username.charAt(0).toUpperCase();
  const isAdmin = user.role === "admin";

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-color transition-colors focus-visible:ring-2 focus-visible:ring-action-color focus-visible:ring-offset-2"
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
      >
        {/* Avatar ou initiale */}
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-action-color text-slate-100 flex items-center justify-center font-semibold text-sm">
            {initial}
          </div>
        )}

        {/* Pseudo */}
        <span className="text-slate-900 font-medium hidden sm:inline">
          {user.username}
        </span>

        {/* Flèche */}
        <FiChevronDown
          className={`text-slate-700 transition-transform ${isOpen ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-color rounded-lg shadow-lg border border-slate-400 py-1 z-50">
          {/* Option: Modifier le profil */}
          <button
            onClick={handleProfileClick}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-slate-900 hover:bg-secondary-color transition-colors text-left"
          >
            <FiUser size={18} className="text-slate-700" />
            <span className="font-medium">Mon profil</span>
          </button>

          {/* Option: Gérer les rôles (admin uniquement) */}
          {isAdmin && (
            <button
              onClick={handleRoleClick}
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-slate-900 hover:bg-secondary-color transition-colors text-left"
            >
              <FiShield size={18} className="text-slate-700" />
              <span className="font-medium">Gérer les rôles</span>
            </button>
          )}

          {/* Séparateur */}
          <div className="border-t border-slate-400 my-1"></div>

          {/* Option: Déconnexion */}
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-slate-900 hover:bg-secondary-color transition-colors text-left"
          >
            <FiLogOut size={18} className="text-slate-700" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
};
