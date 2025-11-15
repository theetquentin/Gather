import { useState, useEffect, useCallback } from "react";
import { FiShield, FiCheck, FiSearch } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/user.service";
import type { User } from "../types/auth.types";
import { ErrorMessage } from "../components/ErrorMessage";

export const RoleManagement = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      const results = await userService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la recherche"
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user" | "moderator"
  ) => {
    setError(null);
    setSuccess(null);
    setUpdatingUserId(userId);

    try {
      await userService.updateRole(userId, newRole);

      // Mettre à jour les résultats localement
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );

      setSuccess(`Rôle mis à jour avec succès`);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la mise à jour du rôle");
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Vérifier que l'utilisateur est admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-page-background flex items-center justify-center">
        <div className="bg-primary-color rounded-2xl shadow-lg p-8">
          <p className="text-slate-900 text-lg">
            Accès refusé : cette page est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-primary-color rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiShield size={32} className="text-action-color" />
            <h1 className="text-3xl font-bold text-slate-900">
              Gestion des rôles
            </h1>
          </div>

          <p className="text-slate-700 mb-6">
            Recherchez un utilisateur par nom ou email pour modifier son rôle.
          </p>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <FiCheck size={18} />
              {success}
            </div>
          )}

          {/* Barre de recherche */}
          <div className="mb-6">
            <label
              htmlFor="search"
              className="block text-slate-900 font-medium mb-1 text-sm"
            >
              Rechercher un utilisateur
            </label>
            <div className="relative">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-700"
              />
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Email ou nom d'utilisateur..."
                className="w-full pl-10 pr-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* État de recherche */}
          {isSearching && (
            <div className="mt-3 text-slate-700 text-sm">
              Recherche en cours...
            </div>
          )}

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Résultats ({searchResults.length})
              </h3>

              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between bg-secondary-color p-3 rounded gap-4"
                >
                  {/* Infos utilisateur */}
                  <div className="flex items-center gap-3 flex-1">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-action-color text-slate-100 flex items-center justify-center font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900">
                        {user.username}
                      </div>
                      <div className="text-sm text-slate-700">{user.email}</div>
                    </div>
                  </div>

                  {/* Sélecteur de rôle */}
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user._id,
                          e.target.value as "admin" | "user" | "moderator"
                        )
                      }
                      disabled={
                        updatingUserId === user._id ||
                        user._id === currentUser._id
                      }
                      className="cursor-pointer px-3 py-1.5 border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color bg-white text-slate-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="moderator">Modérateur</option>
                      <option value="admin">Administrateur</option>
                    </select>

                    {updatingUserId === user._id && (
                      <span className="text-sm text-slate-700">
                        Mise à jour...
                      </span>
                    )}

                    {user._id === currentUser._id && (
                      <span className="text-xs text-slate-700 bg-slate-300 px-2 py-0.5 rounded">
                        Vous
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching &&
            searchQuery.trim().length >= 2 &&
            searchResults.length === 0 && (
              <div className="mt-3 text-slate-700 text-sm">
                Aucun utilisateur trouvé
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
