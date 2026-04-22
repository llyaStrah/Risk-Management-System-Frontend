import { apiClient } from './client'
import { MarketTrends, InvestmentRecommendation } from '../types'

export const analyticsApi = {
  getTrends: async (portfolioId: number, forecastHorizonDays = 30): Promise<MarketTrends> => {
    const response = await apiClient.get<MarketTrends>(
      `/analytics/portfolio/${portfolioId}/trends`,
      { params: { forecastHorizonDays } }
    )
    return response.data
  },

  getRecommendations: async (
    portfolioId: number, 
    riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' = 'MODERATE'
  ): Promise<InvestmentRecommendation[]> => {
    const response = await apiClient.post<InvestmentRecommendation[]>(
      `/analytics/portfolio/${portfolioId}/recommendations`,
      null,
      { params: { riskProfile } }
    )
    return response.data
  },
}
