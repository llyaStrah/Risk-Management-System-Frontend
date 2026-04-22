import { apiClient } from './client'
import { Portfolio, CreatePortfolioRequest, Page, PortfolioPerformance, PortfolioDiversification, OptimizationResult, RebalancingPlan } from '../types'

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

  optimize: async (id: number, strategy: string = 'MAXIMIZE_SHARPE_RATIO'): Promise<OptimizationResult> => {
    const response = await apiClient.post<OptimizationResult>(`/portfolios/${id}/optimize`, null, {
      params: { strategy }
    })
    return response.data
  },

  rebalance: async (id: number, targetWeights: Record<number, number>): Promise<RebalancingPlan> => {
    const response = await apiClient.post<RebalancingPlan>(`/portfolios/${id}/rebalance`, targetWeights)
    return response.data
  },

  getPerformance: async (id: number): Promise<PortfolioPerformance> => {
    const response = await apiClient.get<PortfolioPerformance>(`/portfolios/${id}/performance`)
    return response.data
  },

  getDiversification: async (id: number): Promise<PortfolioDiversification> => {
    const response = await apiClient.get<PortfolioDiversification>(`/portfolios/${id}/diversification`)
    return response.data
  },

  generateReport: async (portfolioId: number): Promise<void> => {
    const response = await apiClient.post(`/portfolios/${portfolioId}/report`, null, {
      responseType: 'blob',
    })
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `portfolio-report-${portfolioId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

export const portfoliosApi = portfolioApi
