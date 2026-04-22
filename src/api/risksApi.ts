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
    const response = await apiClient.post(`/risks/portfolio/${portfolioId}/report`, null, {
      responseType: 'blob',
    })
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `risk-report-portfolio-${portfolioId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

export const risksApi = riskApi
