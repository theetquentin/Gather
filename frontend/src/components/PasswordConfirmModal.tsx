import { useState } from "react";
import { FiLock, FiX } from "react-icons/fi";

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PasswordConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: PasswordConfirmModalProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  const handleCancel = () => {
    setPassword("");
    onCancel();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-primary-color rounded-lg shadow-lg max-w-md w-full p-6 sm:p-8 relative">
        {/* Bouton fermer */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="cursor-pointer absolute top-4 right-4 text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-50"
          aria-label="Fermer"
        >
          <FiX size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Titre */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-action-color flex items-center justify-center shrink-0">
            <FiLock size={20} className="sm:w-6 sm:h-6 text-slate-100" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Confirmer les modifications
          </h2>
        </div>

        {/* Description */}
        <p className="text-slate-700 mb-6">
          Pour sécuriser votre compte, veuillez entrer votre mot de passe actuel
          avant de sauvegarder les modifications.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-slate-900 font-medium mb-2"
            >
              Mot de passe actuel
            </label>
            <input
              type="password"
              id="currentPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              placeholder="Entrez votre mot de passe"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Boutons */}
          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Vérification..." : "Confirmer"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="cursor-pointer w-full bg-secondary-color hover:bg-slate-300 text-slate-900 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
};
