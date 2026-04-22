import { apiClient } from './client'
import { Simulation, SimulationRequest, SimulationResult, Page } from '../types'

export const simulationsApi = {
  getAll: async (page = 0, size = 10): Promise<Page<Simulation>> => {
    const response = await apiClient.get<Page<Simulation>>('/simulations', {
      params: { page, size },
    })
    return response.data
  },

  getById: async (id: number): Promise<Simulation> => {
    const response = await apiClient.get<Simulation>(`/simulations/${id}`)
    return response.data
  },

  create: async (data: SimulationRequest): Promise<Simulation> => {
    const response = await apiClient.post<Simulation>('/simulations', data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/simulations/${id}`)
  },

  getResults: async (id: number): Promise<SimulationResult> => {
    const response = await apiClient.get<SimulationResult>(`/simulations/${id}/results`)
    return response.data
  },

  compare: async (ids: number[]): Promise<any> => {
    const response = await apiClient.post('/simulations/compare', ids)
    return response.data
  },

  export: async (id: number, format: 'CSV' | 'JSON' = 'JSON'): Promise<any> => {
    const response = await apiClient.get(`/simulations/${id}/export`, {
      params: { format },
    })
    return response.data
  },

  analyze: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/simulations/${id}/analyze`)
    return response.data
  },
}
