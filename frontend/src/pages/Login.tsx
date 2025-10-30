import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SEO } from "../components/SEO";

export const Login = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer le message de succès depuis l'état de navigation
  const successMessage = location.state?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const formValues = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      await login({ email: formValues.email, password: formValues.password });
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la connexion",
      );
    } finally {
      setIsLoading(false);
    }
  };

  console.log("render");

  return (
    <div className="min-h-screen bg-page-background flex items-center justify-center px-4 py-8">
      <SEO
        title="Connexion - Gather"
        description="Connectez-vous à votre compte Gather pour gérer vos collections."
        noindex={true}
      />
      <div className="bg-primary-color p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          Connexion
        </h1>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="font-semibold" aria-hidden="true">
              ⚠{" "}
            </span>
            <span className="sr-only">Erreur : </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-slate-900 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-slate-900 font-medium mb-2"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-700">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-action-color hover:text-action-color-hover font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
