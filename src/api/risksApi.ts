import { apiClient } from './client'
import { Risk, CreateRiskRequest, Page, RiskMetrics } from '../types'

export const riskApi = {
  getAll: async (page = 0, size = 10): Promise<Page<Risk>> => {
    const response = await apiClient.get<Page<Risk>>('/risks', {
      params: { page, size },
    })
    return response.data
  },

  getById: async (id: number): Promise<Risk> => {
    const response = await apiClient.get<Risk>(`/risks/${id}`)
    return response.data
  },

  create: async (data: CreateRiskRequest): Promise<Risk> => {
    const response = await apiClient.post<Risk>('/risks', data)
    return response.data
  },

  update: async (id: number, data: Partial<CreateRiskRequest>): Promise<Risk> => {
    const response = await apiClient.put<Risk>(`/risks/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/risks/${id}`)
  },

  getMetrics: async (id: number): Promise<RiskMetrics> => {
    const response = await apiClient.get<RiskMetrics>(`/risks/${id}/metrics`)
    return response.data
  },

  assessPortfolio: async (portfolioId: number): Promise<any> => {
    const response = await apiClient.get(`/risks/portfolio/${portfolioId}/assess`)
    return response.data
  },

  generateReport: async (portfolioId: number): Promise<void> => {
    await apiClient.post(`/risks/portfolio/${portfolioId}/report`)
  },
}

export const risksApi = riskApi
