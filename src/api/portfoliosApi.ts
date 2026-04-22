import { apiClient } from './client'
import { Portfolio, CreatePortfolioRequest, Page, PortfolioPerformance, PortfolioDiversification } from '../types'

export const portfolioApi = {
  getAll: async (page = 0, size = 10): Promise<Page<Portfolio>> => {
    const response = await apiClient.get<Page<Portfolio>>('/portfolios', {
      params: { page, size },
    })
    return response.data
  },

  getById: async (id: number): Promise<Portfolio> => {
    const response = await apiClient.get<Portfolio>(`/portfolios/${id}`)
    return response.data
  },

  create: async (data: CreatePortfolioRequest): Promise<Portfolio> => {
    const response = await apiClient.post<Portfolio>('/portfolios', data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/portfolios/${id}`)
  },

  optimize: async (id: number): Promise<void> => {
    await apiClient.post(`/portfolios/${id}/optimize`)
  },

  rebalance: async (id: number): Promise<void> => {
    await apiClient.post(`/portfolios/${id}/rebalance`)
  },

  getPerformance: async (id: number): Promise<PortfolioPerformance> => {
    const response = await apiClient.get<PortfolioPerformance>(`/portfolios/${id}/performance`)
    return response.data
  },

  getDiversification: async (id: number): Promise<PortfolioDiversification> => {
    const response = await apiClient.get<PortfolioDiversification>(`/portfolios/${id}/diversification`)
    return response.data
  },
}

export const portfoliosApi = portfolioApi
