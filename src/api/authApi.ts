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

  me: async (): Promise<{ username: string; email: string; roles: string[] }> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  // OAuth2 URLs - use absolute URLs without /api/v1 prefix
  getGoogleOAuthUrl: (): string => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080'
    return `${baseUrl}/oauth2/authorization/google`
  },

  getGitHubOAuthUrl: (): string => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080'
    return `${baseUrl}/oauth2/authorization/github`
  },
}
