export interface User {
  id: number
  username: string
  email: string
  roles: string[]
  enabled: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  username: string
  email: string
  roles: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface Risk {
  id: number
  name: string
  description: string
  type: 'MARKET' | 'CREDIT' | 'OPERATIONAL' | 'LIQUIDITY'
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  probability: number
  impact: number
  portfolioId: number
  identifiedAt: string
}

export interface CreateRiskRequest {
  name: string
  description: string
  type: string
  level: string
  probability: number
  impact: number
  portfolioId: number
}

export interface Portfolio {
  id: number
  name: string
  totalValue: number
  ownerId: number
  ownerUsername: string
  assetCount: number
  createdAt: string
  updatedAt: string
}

export interface CreatePortfolioRequest {
  name: string
  totalValue: number
}

export interface Asset {
  id: number
  ticker: string
  name: string
  type: 'STOCK' | 'BOND' | 'COMMODITY' | 'CRYPTO'
  quantity: number
  currentPrice: number
  portfolioId: number
  createdAt: string
}

export interface CreateAssetRequest {
  ticker: string
  name: string
  type: string
  quantity: number
  currentPrice: number
  portfolioId: number
}

export interface Simulation {
  id: number
  name: string
  type: 'MONTE_CARLO' | 'HISTORICAL' | 'PARAMETRIC'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  portfolioId: number
  iterations: number
  timeHorizon: number
  confidenceLevel: number
  startedAt: string
  completedAt: string
  createdAt: string
  result?: SimulationResult
}

export interface SimulationRequest {
  name: string
  type: string
  portfolioId: number
  iterations: number
  timeHorizon: number
  confidenceLevel: number
  distributionType: string
}

export interface SimulationResult {
  id: number
  simulationId: number
  var95: number
  var99: number
  cvar95: number
  cvar99: number
  expectedReturn: number
  standardDeviation: number
  sharpeRatio: number
  maxDrawdown: number
  resultData: Record<string, any>
}

export interface RiskMetrics {
  valueAtRisk: number
  conditionalValueAtRisk: number
  expectedLoss: number
  standardDeviation: number
  beta: number
  sharpeRatio: number
}

export interface PortfolioPerformance {
  portfolioId: number
  portfolioName: string
  startDate: string
  endDate: string
  currentValue: number
  absoluteReturn: number
  relativeReturn: number
  volatility: number
  sharpeRatio: number
  benchmarkReturn: number
  alpha: number
  beta: number
  assetContributions: Record<string, number>
}

export interface PortfolioDiversification {
  portfolioId: number
  portfolioName: string
  numberOfAssets: number
  herfindahlIndex: number
  concentrationByType: Record<string, number>
  diversificationEffectiveness: number
  recommendations: string[]
}

export interface AssetCorrelation {
  correlationMatrix: number[][]
  assetTickers: string[]
}

export interface MarketTrends {
  predictions: Array<{
    date: string
    predictedPrice: number
    confidenceInterval: [number, number]
  }>
  volatilityForecast: number
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

export interface InvestmentRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD'
  asset: string
  reason: string
  confidence: number
  targetAllocation: number
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
