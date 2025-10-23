import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const formValues = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validation côté client
    if (formValues.password !== formValues.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await register({ 
        username: formValues.username, 
        email: formValues.email, 
        password: formValues.password 
      });
      navigate('/login', { 
        state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-background flex items-center justify-center px-4 py-8">
      <div className="bg-primary-color p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
          Inscription
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="font-semibold" aria-hidden="true">⚠ </span>
            <span className="sr-only">Erreur : </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-slate-900 font-medium mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              required
              minLength={3}
              maxLength={20}
            />
            <p className="text-sm text-slate-700 mt-1">
              Entre 3 et 20 caractères
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-slate-900 font-medium mb-2">
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
            <label htmlFor="password" className="block text-slate-900 font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              required
              minLength={8}
              maxLength={30}
            />
            <p className="text-sm text-slate-700 mt-1">
              Au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-slate-900 font-medium mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-2 bg-secondary-color border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-action-color"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-action-color hover:bg-action-color-hover text-slate-100 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-700">
            Déjà un compte ?{' '}
            <Link 
              to="/login" 
              className="text-action-color hover:text-action-color-hover font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
