import { apiClient } from './api.service';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth.types';

// État global de l'authentification
let currentUser: User | null = null;
let authListeners: Array<(user: User | null) => void> = [];

// Notifier tous les écouteurs d'un changement
const notifyListeners = () => {
  authListeners.forEach(callback => callback(currentUser));
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  currentUser = null;
  notifyListeners();
};

// Charger l'utilisateur depuis le localStorage au démarrage
const loadUserFromStorage = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await apiClient.get<{ success: boolean; data: User; errors?: string }>('/auth/me');
      if (response.success) {
        currentUser = response.data;
        notifyListeners();
      } else {
        localStorage.removeItem('token');
      }
    } catch (_error) {
      localStorage.removeItem('token');
    }
  }
};

// Initialiser le service au chargement du module
loadUserFromStorage();

// Service d'authentification simplifié (approche fonctionnelle)
export const authService = {
  // Écouter les changements d'état d'authentification
  onAuthChange(callback: (user: User | null) => void) {
    authListeners.push(callback);
    // Retourner une fonction pour se désabonner
    return () => {
      authListeners = authListeners.filter(listener => listener !== callback);
    };
  },

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: { token: string; user: User }; errors?: string }>('/auth/login', credentials);
      
      if (response.success && response.data.token) {
        // Sauvegarder le token
        localStorage.setItem('token', response.data.token);
        currentUser = response.data.user;
        notifyListeners();
        return { success: true };
      } else {
        return { success: false, error: response.errors || 'Erreur de connexion' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  },

  async register(credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: { id: string; username: string; email: string }; errors?: string }>('/users', credentials);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.errors || 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription' 
      };
    }
  },


  async getCurrentUser(): Promise<void> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User; errors?: string }>('/auth/me');
      if (response.success) {
        currentUser = response.data;
        notifyListeners();
      } else {
        logoutUser();
      }
    } catch (_error) {
      logoutUser();
    }
  },

  isAuthenticated(): boolean {
    return !!currentUser && !!localStorage.getItem('token');
  },

  getCurrentUserData(): User | null {
    return currentUser;
  }
};
