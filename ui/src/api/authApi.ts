import apiClient from './apiClient';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  login: (payload: LoginPayload) => apiClient.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => apiClient.post<AuthResponse>('/auth/register', payload),
  getProfile: () =>
    apiClient.get<{
      success: boolean;
      data: { user: AuthResponse['data']['user'] };
    }>('/auth/profile'),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
};
