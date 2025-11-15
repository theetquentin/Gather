import { useState, useEffect } from 'react';
import { authService, logoutUser } from '../services/auth.service';
import type { User } from '../types/auth.types';

// Hook simplifié pour l'authentification
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = authService.onAuthChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    // Vérifier l'état initial et rafraîchir les données depuis le serveur
    if (authService.isAuthenticated()) {
      authService.refreshUserData().then(() => {
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return unsubscribe;
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    const result = await authService.login(credentials);
    setIsLoading(false);
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur de connexion');
    }
  };

  const register = async (credentials: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    const result = await authService.register(credentials);
    setIsLoading(false);
    
    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'inscription');
    }
  };

  const logout = () => {
    logoutUser();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };
};
