const APP_ENV = import.meta.env.VITE_APP_ENV;
const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;
const API_BASE_URL = APP_ENV === "dev" ? `http://localhost:${BACKEND_PORT}` : `https://${API_DOMAIN}`;

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors || 'Une erreur est survenue');
    }

    return data;
  },

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};

