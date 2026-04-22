import { apiClient } from './client'
import { Asset, CreateAssetRequest, Page, AssetCorrelation } from '../types'

export const assetApi = {
  getAll: async (page = 0, size = 10): Promise<Page<Asset>> => {
    const response = await apiClient.get<Page<Asset>>('/assets', {
      params: { page, size },
    })
    return response.data
  },

  getById: async (id: number): Promise<Asset> => {
    const response = await apiClient.get<Asset>(`/assets/${id}`)
    return response.data
  },

  getByPortfolio: async (portfolioId: number): Promise<Asset[]> => {
    const response = await apiClient.get<Asset[]>(`/assets/portfolio/${portfolioId}`)
    return response.data
  },

  create: async (data: CreateAssetRequest): Promise<Asset> => {
    const response = await apiClient.post<Asset>('/assets', data)
    return response.data
  },

  update: async (id: number, data: Partial<CreateAssetRequest>): Promise<Asset> => {
    const response = await apiClient.put<Asset>(`/assets/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assets/${id}`)
  },

  updatePrice: async (id: number): Promise<Asset> => {
    const response = await apiClient.post<Asset>(`/assets/${id}/update-price`)
    return response.data
  },

  updatePrices: async (portfolioId: number): Promise<Asset[]> => {
    const response = await apiClient.post<Asset[]>(`/assets/portfolio/${portfolioId}/update-prices`)
    return response.data
  },

  getCorrelation: async (portfolioId: number): Promise<AssetCorrelation> => {
    const response = await apiClient.get<AssetCorrelation>(`/assets/portfolio/${portfolioId}/correlation`)
    return response.data
  },
}

export const assetsApi = assetApi
