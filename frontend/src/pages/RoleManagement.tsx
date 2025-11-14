import { useState } from "react";
import { FiSearch, FiShield, FiCheck } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/user.service";
import type { User } from "../types/auth.types";

export const RoleManagement = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (searchQuery.trim().length < 2) {
      setError("La recherche doit contenir au moins 2 caractères");
      return;
    }

    setIsSearching(true);

    try {
      const results = await userService.searchUsers(searchQuery);
      setSearchResults(results);

      if (results.length === 0) {
        setError("Aucun utilisateur trouvé");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la recherche");
      }
    } finally {
      setIsSearching(false);
    }
  };

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

          {/* Formulaire de recherche */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FiSearch
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-700"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color bg-white text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="cursor-pointer bg-action-color hover:bg-action-color-hover text-slate-100 px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? "Recherche..." : "Rechercher"}
              </button>
            </div>
          </form>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <FiCheck size={18} />
              {success}
            </div>
          )}

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Résultats ({searchResults.length})
              </h2>

              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="bg-white border border-slate-400 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Infos utilisateur */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-action-color text-slate-100 flex items-center justify-center font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.username}
                          </p>
                          <p className="text-sm text-slate-700">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sélecteur de rôle */}
                    <div className="flex items-center gap-3">
                      <label className="text-slate-900 font-medium">
                        Rôle :
                      </label>
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
                        className="cursor-pointer px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-action-color bg-white text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="text-sm text-slate-700">
                          (Vous)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
