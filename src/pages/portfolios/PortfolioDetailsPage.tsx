import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioApi } from '../../api/portfoliosApi'
import { riskApi } from '../../api/risksApi'
import { assetApi } from '../../api/assetsApi'
import { analyticsApi } from '../../api/analyticsApi'
import { OptimizationResult, RebalancingPlan, Asset } from '../../types'
import { ArrowLeft, TrendingUp, BarChart3, PieChart, RefreshCw, FileText, Zap, X } from 'lucide-react'

export default function PortfolioDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'diversification' | 'risks' | 'analytics'>('overview')
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [rebalancingPlan, setRebalancingPlan] = useState<RebalancingPlan | null>(null)
  const [showOptimizeModal, setShowOptimizeModal] = useState(false)
  const [showRebalanceModal, setShowRebalanceModal] = useState(false)

  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => portfolioApi.getById(Number(id)),
    enabled: !!id,
  })

  const { data: assets } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetApi.getByPortfolio(Number(id)),
    enabled: !!id,
  })

  const { data: performance } = useQuery({
    queryKey: ['portfolio-performance', id],
    queryFn: () => portfolioApi.getPerformance(Number(id)),
    enabled: !!id,
  })

  const { data: diversification } = useQuery({
    queryKey: ['portfolio-diversification', id],
    queryFn: () => portfolioApi.getDiversification(Number(id)),
    enabled: !!id && activeTab === 'diversification',
  })

  const { data: riskAssessment, isLoading: riskLoading } = useQuery({
    queryKey: ['portfolio-risk-assessment', id],
    queryFn: () => riskApi.assessPortfolio(Number(id)),
    enabled: !!id && activeTab === 'risks',
    retry: false,
  })

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['portfolio-trends', id],
    queryFn: () => analyticsApi.getTrends(Number(id)),
    enabled: !!id && activeTab === 'analytics',
    retry: false,
  })

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['portfolio-recommendations', id],
    queryFn: () => analyticsApi.getRecommendations(Number(id)),
    enabled: !!id && activeTab === 'analytics',
    retry: false,
  })

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading portfolio</p>
        <button onClick={() => navigate('/portfolios')} className="btn btn-secondary mt-4">
          Back to Portfolios
        </button>
      </div>
    )
  }

  const optimizeMutation = useMutation({
    mutationFn: (strategy: string) => portfolioApi.optimize(Number(id), strategy),
    onSuccess: (result) => {
      setOptimizationResult(result)
      setShowOptimizeModal(true)
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to optimize portfolio'}`)
    },
  })

  const rebalanceMutation = useMutation({
    mutationFn: (targetWeights: Record<number, number>) => portfolioApi.rebalance(Number(id), targetWeights),
    onSuccess: (plan) => {
      setRebalancingPlan(plan)
      setShowRebalanceModal(true)
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to rebalance portfolio'}`)
    },
  })

  const handleOptimize = () => {
    optimizeMutation.mutate('MAXIMIZE_SHARPE_RATIO')
  }

  const handleRebalance = () => {
    if (!optimizationResult) {
      alert('Please run optimization first to get target weights')
      return
    }
    rebalanceMutation.mutate(optimizationResult.optimizedWeights)
  }

  const getAssetName = (assetId: number): string => {
    const asset = assets?.find((a: Asset) => a.id === assetId)
    return asset ? `${asset.ticker} (${asset.name})` : `Asset ${assetId}`
  }

  const updatePricesMutation = useMutation({
    mutationFn: () => assetApi.updatePrices(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] })
      alert('Asset prices updated successfully!')
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to update prices'}`)
    },
  })

  const generateReportMutation = useMutation({
    mutationFn: () => portfolioApi.generateReport(Number(id)),
    onSuccess: () => {
      alert('Comprehensive portfolio report PDF downloaded successfully!')
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to generate report'}`)
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!portfolio) {
    return <div className="text-center py-12">Portfolio not found</div>
  }

  return (
    <div>
      <button
        onClick={() => navigate('/portfolios')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Portfolios
      </button>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{portfolio.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => updatePricesMutation.mutate()}
              disabled={updatePricesMutation.isPending}
              className="btn btn-secondary flex items-center"
              title="Update Asset Prices"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
              Update Prices
            </button>
            <button
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              className="btn btn-primary flex items-center"
              title="Generate Comprehensive Report (PDF)"
            >
              <FileText className={`w-4 h-4 mr-2 ${generateReportMutation.isPending ? 'animate-pulse' : ''}`} />
              Generate Report
            </button>
            <button
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending}
              className="btn btn-primary flex items-center"
              title="Optimize Portfolio"
            >
              <Zap className="w-4 h-4 mr-2" />
              Optimize
            </button>
            <button
              onClick={handleRebalance}
              disabled={rebalanceMutation.isPending || !optimizationResult}
              className="btn btn-primary flex items-center"
              title="Rebalance Portfolio - Run Optimize first"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Rebalance
            </button>
          </div>
        </div>
        <p className="text-gray-600">Total Value: ${(performance?.currentValue || portfolio.totalValue || 0).toLocaleString()}</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 font-medium ${activeTab === 'performance' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('diversification')}
            className={`px-4 py-2 font-medium ${activeTab === 'diversification' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
          >
            Diversification
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 font-medium ${activeTab === 'risks' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
          >
            Risks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium ${activeTab === 'analytics' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Portfolio Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Owner</p>
              <p className="font-medium">{portfolio.ownerUsername || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-medium">{new Date(portfolio.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Assets Count</p>
              <p className="font-medium">{portfolio.assetCount || 0}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-medium">{new Date(portfolio.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && performance && (
        <div className="space-y-6">
          <div className="card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Period</p>
                <p className="font-medium">
                  {new Date(performance.startDate).toLocaleDateString()} - {new Date(performance.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Current Value</p>
                <p className="font-medium">${performance.currentValue?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Returns
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Absolute Return:</span>
                  <span className="font-bold text-green-600">${performance.absoluteReturn?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relative Return:</span>
                  <span className="font-bold text-green-600">{(performance.relativeReturn * 100)?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Benchmark Return:</span>
                  <span className="font-bold">{(performance.benchmarkReturn * 100)?.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Risk Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volatility:</span>
                  <span className="font-bold">{(performance.volatility * 100)?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sharpe Ratio:</span>
                  <span className="font-bold text-primary-600">{performance.sharpeRatio?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alpha:</span>
                  <span className="font-bold text-green-600">{(performance.alpha * 100)?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beta:</span>
                  <span className="font-bold">{performance.beta?.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {performance.assetContributions && Object.keys(performance.assetContributions).length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Asset Contributions</h3>
              <div className="space-y-2">
                {Object.entries(performance.assetContributions).map(([assetName, contribution]) => (
                  <div key={assetName} className="flex items-center">
                    <span className="w-32 text-gray-600">{assetName}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                      <div
                        className="bg-primary-600 h-4 rounded-full"
                        style={{ width: `${Math.min(Math.abs(contribution), 100)}%` }}
                      />
                    </div>
                    <span className="font-medium">{contribution.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'diversification' && diversification && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Diversification Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Number of Assets</p>
                <p className="text-2xl font-bold">{diversification.numberOfAssets}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Herfindahl Index</p>
                <p className="text-2xl font-bold">{diversification.herfindahlIndex?.toFixed(4)}</p>
                <p className="text-xs text-gray-500 mt-1">Lower is better (0-1)</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Diversification Effectiveness</p>
                <p className="text-2xl font-bold">{(diversification.diversificationEffectiveness * 100)?.toFixed(1)}%</p>
              </div>
            </div>

            {diversification.concentrationByType && Object.keys(diversification.concentrationByType).length > 0 && (
              <div>
                <h4 className="font-bold mb-3">Concentration by Asset Type</h4>
                <div className="space-y-2">
                  {Object.entries(diversification.concentrationByType).map(([type, value]) => (
                    <div key={type} className="flex items-center">
                      <span className="w-32 text-gray-600">{type}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                        <div
                          className={`h-4 rounded-full ${
                            value > 0.7 ? 'bg-red-600' :
                            value > 0.4 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {diversification.recommendations && diversification.recommendations.length > 0 && (
            <div className="card bg-yellow-50 border-l-4 border-yellow-500">
              <h4 className="font-bold mb-3 flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                Recommendations
              </h4>
              <ul className="space-y-2">
                {diversification.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Risk Assessment</h3>

            {riskLoading ? (
              <p className="text-gray-600">Loading risk assessment...</p>
            ) : riskAssessment ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="card bg-blue-50">
                    <p className="text-gray-600 text-sm mb-1">Total Risks</p>
                    <p className="text-3xl font-bold text-blue-600">{riskAssessment.totalRisks}</p>
                  </div>
                  <div className="card bg-red-50">
                    <p className="text-gray-600 text-sm mb-1">Critical Risks</p>
                    <p className="text-3xl font-bold text-red-600">{riskAssessment.criticalRisks?.length || 0}</p>
                  </div>
                  <div className="card bg-orange-50">
                    <p className="text-gray-600 text-sm mb-1">Aggregated Score</p>
                    <p className="text-3xl font-bold text-orange-600">{riskAssessment.aggregatedRiskScore}</p>
                  </div>
                  <div className="card bg-purple-50">
                    <p className="text-gray-600 text-sm mb-1">Risk Types</p>
                    <p className="text-3xl font-bold text-purple-600">{Object.keys(riskAssessment.risksByType || {}).length}</p>
                  </div>
                </div>

                {/* Risks by Level */}
                {riskAssessment.risksByLevel && Object.keys(riskAssessment.risksByLevel).length > 0 && (
                  <div className="card">
                    <h4 className="font-bold mb-3">Risks by Level</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(riskAssessment.risksByLevel).map(([level, count]) => (
                        <div key={level} className="text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                            level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {level}
                          </span>
                          <p className="text-2xl font-bold mt-2">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Risks */}
                {riskAssessment.criticalRisks && riskAssessment.criticalRisks.length > 0 && (
                  <div className="card bg-red-50 border-l-4 border-red-500">
                    <h4 className="font-bold mb-3 flex items-center">
                      <span className="text-red-600 mr-2">⚠️</span>
                      Critical Risks Requiring Immediate Attention
                    </h4>
                    <div className="space-y-3">
                      {riskAssessment.criticalRisks.map((risk: any) => (
                        <div key={risk.id} className="bg-white p-4 rounded border border-red-200">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-bold text-lg">{risk.name}</h5>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              risk.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {risk.level}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium ml-2">{risk.type}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Probability:</span>
                              <span className="font-medium ml-2">{(risk.probability * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Impact:</span>
                              <span className="font-medium ml-2">${risk.impact?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risks by Type */}
                {riskAssessment.risksByType && Object.keys(riskAssessment.risksByType).length > 0 && (
                  <div className="card">
                    <h4 className="font-bold mb-3">Risks by Type</h4>
                    <div className="space-y-4">
                      {Object.entries(riskAssessment.risksByType).map(([type, risks]: [string, any]) => (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-700">{type}</h5>
                            <span className="text-sm text-gray-600">{risks.length} risk(s)</span>
                          </div>
                          <div className="space-y-2">
                            {risks.map((risk: any) => (
                              <div key={risk.id} className="bg-gray-50 p-3 rounded flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{risk.name}</p>
                                  <p className="text-sm text-gray-600">{risk.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    risk.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                    risk.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                    risk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {risk.level}
                                  </span>
                                  <span className="text-sm text-gray-600">${risk.impact?.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Matrix */}
                {riskAssessment.riskMatrix && Object.keys(riskAssessment.riskMatrix).length > 0 && (
                  <div className="card">
                    <h4 className="font-bold mb-3">Risk Matrix (Level × Type)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(riskAssessment.riskMatrix).map(([key, score]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600 mb-1">{key.replace('_', ' ')}</p>
                          <p className="text-xl font-bold">{score}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No risk assessment data available.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Market Trends Prediction</h3>
            {trendsLoading ? (
              <p className="text-gray-600">Loading trends...</p>
            ) : trends ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">Forecast Horizon</p>
                    <p className="text-2xl font-bold">{trends.forecastHorizonDays} days</p>
                  </div>
                  {trends.volatilityForecast && typeof trends.volatilityForecast === 'object' && (
                    <>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Current Volatility</p>
                        <p className="text-2xl font-bold">{(trends.volatilityForecast.currentVolatility * 100)?.toFixed(2)}%</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Predicted Volatility</p>
                        <p className="text-2xl font-bold">{(trends.volatilityForecast.predictedVolatility * 100)?.toFixed(2)}%</p>
                        <p className="text-xs text-gray-600 mt-1">{trends.volatilityForecast.regime}</p>
                      </div>
                    </>
                  )}
                </div>

                {trends.assetForecasts && Object.keys(trends.assetForecasts).length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3">Asset Forecasts</h4>
                    <div className="space-y-4">
                      {Object.entries(trends.assetForecasts).map(([ticker, forecast]: [string, any]) => (
                        <div key={ticker} className="bg-gray-50 p-4 rounded">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-lg">{forecast.ticker}</h5>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              forecast.trendDirection === 'Bullish' ? 'bg-green-100 text-green-800' :
                              forecast.trendDirection === 'Bearish' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {forecast.trendDirection}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">Current Price</p>
                              <p className="font-bold">${forecast.currentPrice?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Predicted Price</p>
                              <p className="font-bold text-primary-600">${forecast.predictedPrice?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Price Range</p>
                              <p className="text-sm">${forecast.lowerBound?.toFixed(2)} - ${forecast.upperBound?.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Confidence</p>
                              <p className="font-bold">{(forecast.confidence * 100)?.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trends.marketSentiment && (
                  <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
                    <h4 className="font-bold mb-3">Market Sentiment</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sentiment</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trends.marketSentiment.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                          trends.marketSentiment.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trends.marketSentiment.sentiment}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sentiment Score</p>
                        <p className="text-xl font-bold">{(trends.marketSentiment.sentimentScore * 100)?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bullish Indicators</p>
                        <p className="text-xl font-bold text-green-600">{trends.marketSentiment.bullishIndicators}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bearish Indicators</p>
                        <p className="text-xl font-bold text-red-600">{trends.marketSentiment.bearishIndicators}</p>
                      </div>
                    </div>
                  </div>
                )}

                {trends.recommendations && trends.recommendations.length > 0 && (
                  <div className="card bg-blue-50 border-l-4 border-blue-500">
                    <h4 className="font-bold mb-3">Trend Recommendations</h4>
                    <ul className="space-y-2">
                      {trends.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No trends data available.</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Investment Recommendations</h3>
            {recommendationsLoading ? (
              <p className="text-gray-600">Loading recommendations...</p>
            ) : recommendations ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">Portfolio</p>
                    <p className="font-bold text-lg">{recommendations.portfolioName}</p>
                    <p className="text-xs text-gray-500">Generated: {new Date(recommendations.generatedAt).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">Risk Profile</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      recommendations.riskProfile === 'AGGRESSIVE' ? 'bg-red-100 text-red-800' :
                      recommendations.riskProfile === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {recommendations.riskProfile}
                    </span>
                  </div>
                </div>

                {recommendations.currentAssessment && (
                  <div className="card bg-blue-50">
                    <h4 className="font-bold mb-3">Current Portfolio Assessment</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Assets</p>
                        <p className="text-xl font-bold">{recommendations.currentAssessment.numberOfAssets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Value</p>
                        <p className="text-xl font-bold">${recommendations.currentAssessment.totalValue?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Diversification</p>
                        <p className="text-xl font-bold">{recommendations.currentAssessment.diversificationScore?.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Risk Score</p>
                        <p className="text-xl font-bold text-orange-600">{recommendations.currentAssessment.riskScore?.toFixed(1)}</p>
                      </div>
                    </div>
                    {recommendations.currentAssessment.typeDistribution && Object.keys(recommendations.currentAssessment.typeDistribution).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Asset Type Distribution</p>
                        <div className="space-y-2">
                          {Object.entries(recommendations.currentAssessment.typeDistribution).map(([type, weight]: [string, any]) => (
                            <div key={type} className="flex items-center">
                              <span className="w-24 text-sm text-gray-600">{type}:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${weight * 100}%` }} />
                              </div>
                              <span className="text-sm font-medium">{(weight * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {recommendations.optimalAllocation && Object.keys(recommendations.optimalAllocation).length > 0 && (
                  <div className="card bg-green-50">
                    <h4 className="font-bold mb-3">Optimal Allocation</h4>
                    <div className="space-y-2">
                      {Object.entries(recommendations.optimalAllocation).map(([assetId, weight]: [string, any]) => (
                        <div key={assetId} className="flex items-center">
                          <span className="w-32 text-sm text-gray-600">Asset {assetId}:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                            <div className="bg-green-600 h-4 rounded-full" style={{ width: `${weight * 100}%` }} />
                          </div>
                          <span className="font-medium">{(weight * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.rebalancingRecommendations && recommendations.rebalancingRecommendations.length > 0 && (
                  <div className="card bg-yellow-50 border-l-4 border-yellow-500">
                    <h4 className="font-bold mb-3">Rebalancing Recommendations</h4>
                    <div className="space-y-3">
                      {recommendations.rebalancingRecommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rec.assetName}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.action === 'INCREASE' ? 'bg-green-100 text-green-800' :
                              rec.action === 'DECREASE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rec.action}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{rec.rationale}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>Current: {(rec.currentWeight * 100).toFixed(1)}%</span>
                            <span>→</span>
                            <span className="font-bold">Target: {(rec.targetWeight * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.newAssetSuggestions && recommendations.newAssetSuggestions.length > 0 && (
                  <div className="card bg-purple-50 border-l-4 border-purple-500">
                    <h4 className="font-bold mb-3">New Asset Suggestions</h4>
                    <div className="space-y-3">
                      {recommendations.newAssetSuggestions.map((suggestion: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{suggestion.assetName}</span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {suggestion.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{suggestion.rationale}</p>
                          <p className="text-xs text-gray-500">Suggested Weight: {(suggestion.suggestedWeight * 100).toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.actionableInsights && recommendations.actionableInsights.length > 0 && (
                  <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
                    <h4 className="font-bold mb-3 flex items-center">
                      <span className="text-orange-600 mr-2">💡</span>
                      Actionable Insights
                    </h4>
                    <ul className="space-y-2">
                      {recommendations.actionableInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No recommendations available.</p>
            )}
          </div>
        </div>
      )}

      {/* Optimization Result Modal */}
      {showOptimizeModal && optimizationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Portfolio Optimization Results</h2>
                <button onClick={() => setShowOptimizeModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="card bg-blue-50">
                    <p className="text-sm text-gray-600 mb-1">Strategy</p>
                    <p className="text-lg font-bold">{optimizationResult.strategy.replace('_', ' ')}</p>
                  </div>
                  <div className="card bg-green-50">
                    <p className="text-sm text-gray-600 mb-1">Expected Return</p>
                    <p className="text-lg font-bold text-green-600">{optimizationResult.expectedReturn.toFixed(2)}%</p>
                  </div>
                  <div className="card bg-orange-50">
                    <p className="text-sm text-gray-600 mb-1">Expected Risk</p>
                    <p className="text-lg font-bold text-orange-600">{(optimizationResult.expectedRisk * 100).toFixed(2)}%</p>
                  </div>
                </div>

                <div className="card bg-purple-50">
                  <p className="text-sm text-gray-600 mb-1">Sharpe Ratio</p>
                  <p className="text-3xl font-bold text-purple-600">{optimizationResult.sharpeRatio.toFixed(4)}</p>
                  <p className="text-xs text-gray-500 mt-1">Higher is better (risk-adjusted return)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-bold mb-4">Current Weights</h3>
                    <div className="space-y-2">
                      {Object.entries(optimizationResult.currentWeights).map(([assetId, weight]) => (
                        <div key={assetId} className="flex items-center">
                          <span className="w-40 text-sm text-gray-600 truncate">{getAssetName(Number(assetId))}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${weight * 100}%` }} />
                          </div>
                          <span className="font-medium w-16 text-right">{(weight * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="font-bold mb-4">Optimized Weights</h3>
                    <div className="space-y-2">
                      {Object.entries(optimizationResult.optimizedWeights).map(([assetId, weight]) => (
                        <div key={assetId} className="flex items-center">
                          <span className="w-40 text-sm text-gray-600 truncate">{getAssetName(Number(assetId))}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                            <div className="bg-green-600 h-4 rounded-full" style={{ width: `${weight * 100}%` }} />
                          </div>
                          <span className="font-medium w-16 text-right">{(weight * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowOptimizeModal(false)} className="btn btn-secondary">
                    Close
                  </button>
                  <button onClick={handleRebalance} className="btn btn-primary">
                    Apply Rebalancing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rebalancing Plan Modal */}
      {showRebalanceModal && rebalancingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Rebalancing Plan</h2>
                <button onClick={() => setShowRebalanceModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="card bg-blue-50">
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-lg font-bold">${rebalancingPlan.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="card bg-purple-50">
                    <p className="text-sm text-gray-600 mb-1">Transactions</p>
                    <p className="text-lg font-bold">{rebalancingPlan.transactions.length}</p>
                  </div>
                  <div className="card bg-orange-50">
                    <p className="text-sm text-gray-600 mb-1">Transaction Costs</p>
                    <p className="text-lg font-bold text-orange-600">${rebalancingPlan.transactionCosts.toFixed(2)}</p>
                  </div>
                  <div className="card bg-red-50">
                    <p className="text-sm text-gray-600 mb-1">Tax Impact</p>
                    <p className="text-lg font-bold text-red-600">${rebalancingPlan.taxImpact.toFixed(2)}</p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold mb-4">Required Transactions</h3>
                  {rebalancingPlan.transactions.length === 0 ? (
                    <p className="text-gray-600">No transactions needed - portfolio is already balanced</p>
                  ) : (
                    <div className="space-y-3">
                      {rebalancingPlan.transactions.map((transaction, idx) => (
                        <div key={idx} className={`p-4 rounded border-l-4 ${
                          transaction.type === 'BUY' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded font-bold text-sm ${
                                transaction.type === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {transaction.type}
                              </span>
                              <span className="font-bold text-lg">{transaction.ticker}</span>
                            </div>
                            <span className="text-2xl font-bold">${transaction.value.toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium ml-2">{transaction.quantity.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium ml-2">${transaction.price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Value:</span>
                              <span className="font-medium ml-2">${transaction.value.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card bg-yellow-50 border-l-4 border-yellow-500">
                  <h4 className="font-bold mb-3">⚠️ Important Notes</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Transaction costs: 0.1% of transaction value</li>
                    <li>• Tax impact: 15% on all sales (capital gains tax)</li>
                    <li>• Total cost: ${(rebalancingPlan.transactionCosts + rebalancingPlan.taxImpact).toFixed(2)}</li>
                    <li>• This is a simulation - no actual trades will be executed</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setShowRebalanceModal(false)} className="btn btn-primary">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
