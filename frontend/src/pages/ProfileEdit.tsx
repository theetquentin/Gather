import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";
import { PasswordConfirmModal } from "../components/PasswordConfirmModal";
import { AvatarUpload } from "../components/AvatarUpload";

export const ProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError("Utilisateur non connecté");
      return;
    }

    // Vérifier si le nouveau mot de passe et la confirmation correspondent
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Vérifier s'il y a des modifications
    const hasUsernameChange = formData.username !== user.username;
    const hasEmailChange = formData.email !== user.email;
    const hasPasswordChange = !!formData.newPassword;

    if (!hasUsernameChange && !hasEmailChange && !hasPasswordChange) {
      setError("Aucune modification détectée");
      return;
    }

    // Ouvrir la popup de confirmation
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (currentPassword: string) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Construire les données à envoyer
      const updateData: {
        currentPassword: string;
        username?: string;
        email?: string;
        newPassword?: string;
      } = {
        currentPassword,
      };

      if (formData.username && formData.username !== user.username) {
        updateData.username = formData.username;
      }

      if (formData.email && formData.email !== user.email) {
        updateData.email = formData.email;
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      await userService.updateProfile(user._id, updateData);

      // Rafraîchir les données utilisateur
      await authService.refreshUserData();

      setSuccess("Profil mis à jour avec succès !");
      setShowPasswordModal(false);

      // Réinitialiser les champs de mot de passe
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de la mise à jour");
      }
      setShowPasswordModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAvatarChange = async (newAvatarUrl: string | null) => {
    // Rafraîchir les données utilisateur pour mettre à jour l'avatar
    await authService.refreshUserData();
    setSuccess(
      newAvatarUrl
        ? "Avatar mis à jour avec succès !"
        : "Avatar supprimé avec succès !",
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-page-background flex items-center justify-center">
        <p className="text-slate-900">
          Vous devez être connecté pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-page-background flex items-center justify-center px-4 py-8">
        <div className="bg-primary-color rounded-lg shadow-lg max-w-2xl w-full p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            Modifier mon profil
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Avatar Upload Section */}
          <div className="mb-6 pb-6 border-b border-slate-300">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Photo de profil
            </h2>
            <AvatarUpload
              currentAvatarUrl={user.profilePicture}
              onAvatarChange={handleAvatarChange}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-slate-900 font-medium mb-2"
              >
                Pseudonyme
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
                minLength={3}
                maxLength={20}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-slate-900 font-medium mb-2"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-slate-900 font-medium mb-2"
              >
                Nouveau mot de passe (optionnel)
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
                minLength={8}
                maxLength={30}
                placeholder="Laisser vide pour ne pas changer"
              />
              <p className="text-sm text-slate-700 mt-1">
                Min. 8 caractères, avec majuscule, minuscule, chiffre et
                caractère spécial
              </p>
            </div>

            {/* Confirm Password */}
            {formData.newPassword && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-slate-900 font-medium mb-2"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
                  required={!!formData.newPassword}
                />
              </div>
            )}

            {/* Buttons */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
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

      {/* Modal de confirmation du mot de passe */}
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setShowPasswordModal(false)}
        isLoading={isLoading}
      />
    </>
  );
};
