import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          username: data.username,
          email: data.email,
          roles: data.roles,
          isAuthenticated: true,
        }),
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
