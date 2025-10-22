export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
  errors?: string;
}

export interface MeResponse {
  success: boolean;
  message?: string;
  data: User;
  errors?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    username: string;
    email: string;
  };
  errors?: string;
}

