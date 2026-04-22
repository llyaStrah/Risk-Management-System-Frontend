import { apiClient } from './client'
import { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  // OAuth2 URLs
  getGoogleOAuthUrl: (): string => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`
  },

  getGitHubOAuthUrl: (): string => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/github`
  },
}
