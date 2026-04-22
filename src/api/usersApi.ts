import { apiClient } from './client'
import { Page } from '../types'

export interface User {
  id: number
  username: string
  email: string
  roles: string[]
  enabled: boolean
  createdAt: string
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

export const usersApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/users/me', data)
    return response.data
  },

  getAllUsers: async (page = 0, size = 10): Promise<Page<User>> => {
    const response = await apiClient.get<Page<User>>('/users', {
      params: { page, size },
    })
    return response.data
  },

  updateUserRoles: async (userId: number, roles: string[]): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}/roles`, roles)
    return response.data
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}`)
  },
}
