import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/user.service";
import { shareService } from "../services/share.service";
import { useAuth } from "../hooks/useAuth";
import { ErrorMessage } from "./ErrorMessage";
import type { User } from "../types/auth.types";
import type { Share, ShareRights } from "../types/share.types";
import { FiTrash, FiMail } from "react-icons/fi";

interface UserInviteProps {
  collectionId: string;
  onInviteSuccess?: () => void;
}

export const UserInvite = ({
  collectionId,
  onInviteSuccess,
}: UserInviteProps) => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [existingShares, setExistingShares] = useState<Share[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<string | null>(null);
  const [selectedRights, setSelectedRights] = useState<ShareRights>("read");
  const [error, setError] = useState("");

  const loadExistingShares = useCallback(async () => {
    try {
      const shares = await shareService.getCollectionShares(collectionId);
      setExistingShares(shares);
    } catch (err) {
      console.error("Erreur lors du chargement des partages:", err);
    }
  }, [collectionId]);

  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      setError("");
      const results = await userService.searchUsers(searchQuery);

      // Filtrer les utilisateurs déjà invités
      const invitedUserIds = existingShares.map((share) =>
        typeof share.guestId === "string" ? share.guestId : share.guestId._id,
      );

      // Filtrer les utilisateurs : exclure les déjà invités ET l'utilisateur connecté (propriétaire)
      const filteredResults = results.filter(
        (user) =>
          !invitedUserIds.includes(user._id) &&
          user._id !== currentUser?._id,
      );

      setSearchResults(filteredResults);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la recherche",
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, existingShares, currentUser]);

  // Réinitialiser l'état quand la collection change
  useEffect(() => {
    setSearchQuery("");
    setSearchResults([]);
    setError("");
    setSelectedRights("read");
    setIsInviting(null);
  }, [collectionId]);

  // Charger les partages existants
  useEffect(() => {
    loadExistingShares();
  }, [loadExistingShares]);

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

  const handleInvite = async (userId: string) => {
    try {
      setIsInviting(userId);
      setError("");

      await shareService.createShare({
        collectionId,
        guestId: userId,
        rights: selectedRights,
      });

      // Recharger les partages existants
      await loadExistingShares();

      // Retirer l'utilisateur des résultats de recherche
      setSearchResults((prev) => prev.filter((u) => u._id !== userId));

      if (onInviteSuccess) {
        onInviteSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'invitation",
      );
    } finally {
      setIsInviting(null);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      setError("");
      await shareService.deleteShare(shareId);
      await loadExistingShares();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Accepté";
      case "refused":
        return "Refusé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "refused":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMessage message={error} />}

      {/* Section de recherche */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Inviter des utilisateurs
        </h3>

        {/* Sélection des droits */}
        <div className="mb-3">
          <label
            htmlFor="rights"
            className="block text-slate-900 font-medium mb-1 text-sm"
          >
            Droits d'accès
          </label>
          <select
            id="rights"
            value={selectedRights}
            onChange={(e) => setSelectedRights(e.target.value as ShareRights)}
            className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
          >
            <option value="read">Lecture seule</option>
            <option value="edit">Lecture et modification</option>
          </select>
        </div>

        {/* Barre de recherche */}
        <div>
          <label
            htmlFor="search"
            className="block text-slate-900 font-medium mb-1 text-sm"
          >
            Rechercher un utilisateur
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Email ou nom d'utilisateur..."
            className="w-full px-3 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color text-slate-900 text-sm"
          />
        </div>

        {/* Résultats de recherche */}
        {isSearching && (
          <div className="mt-3 text-slate-700 text-sm">
            Recherche en cours...
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-secondary-color p-3 rounded"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {user.username}
                  </div>
                  <div className="text-sm text-slate-700">{user.email}</div>
                </div>
                <button
                  onClick={() => handleInvite(user._id)}
                  disabled={isInviting === user._id}
                  className="cursor-pointer flex items-center gap-2 px-4 py-1.5 bg-action-color hover:bg-action-color-hover text-slate-100  rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isInviting === user._id ? "Invitation..." : "Inviter"}{" "}
                  <FiMail className="mt-0.5" />
                </button>
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

      {/* Liste des partages existants */}
      {existingShares.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Utilisateurs invités ({existingShares.length})
          </h3>
          <div className="space-y-2">
            {existingShares.map((share) => {
              const guest =
                typeof share.guestId === "string" ? null : share.guestId;
              return (
                <div
                  key={share._id}
                  className="flex items-center justify-between bg-primary-color p-3 rounded"
                >
                  <div className="flex-1">
                    <div className="flex flex-col items-start sm:flex-row gap-2">
                      <span className="font-medium text-slate-900">
                        {guest?.username || "Utilisateur"}
                        {guest?.email && (
                          <div className="text-sm text-slate-700 mt-1">
                            {guest.email}
                          </div>
                        )}
                      </span>
                      <span
                        className={`px-2 py-0.5 ${getStatusColor(share.status)} text-slate-100 text-xs font-medium rounded`}
                      >
                        {getStatusLabel(share.status)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-600 text-slate-100 text-xs font-medium rounded">
                        {share.rights === "read" ? "Lecture" : "Édition"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="cursor-pointer p-2 mx-6 transition-colors rounded-full hover:bg-secondary-color text-red-600 hover:text-red-800 text-2xl"
                    onClick={() => handleRemoveShare(share._id)}
                  >
                    <FiTrash />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
