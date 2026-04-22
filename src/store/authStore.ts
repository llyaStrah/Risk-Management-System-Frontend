import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { decodeJWT } from '../utils/jwt'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  username: string | null
  email: string | null
  roles: string[]
  isAuthenticated: boolean
  setAuth: (data: {
    accessToken: string
    refreshToken: string
    username: string
    email: string
    roles: string[]
  }) => void
  clearAuth: () => void
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      username: null,
      email: null,
      roles: [],
      isAuthenticated: false,
      setAuth: (data) => {
        // Проверяем наличие accessToken
        if (!data.accessToken) {
          console.error('No access token provided')
          return
        }
        
        // Декодируем JWT токен для получения username с правильной кодировкой
        const decoded = decodeJWT(data.accessToken)
        const username = decoded?.sub || data.username
        
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          username: username,
          email: data.email,
          roles: data.roles,
          isAuthenticated: true,
        })
      },
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          username: null,
          email: null,
          roles: [],
          isAuthenticated: false,
        }),
      hasRole: (role) => get().roles.includes(role),
    }),
    {
      name: 'auth-storage',
    }
  )
)
