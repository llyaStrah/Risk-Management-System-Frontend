import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { simulationsApi } from '../../api/simulationsApi'
import { portfoliosApi } from '../../api/portfoliosApi'
import { Plus, Trash2, Eye, Download, GitCompare } from 'lucide-react'
import { SimulationRequest } from '../../types'

export default function SimulationsPage() {
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([])
  const [comparisonResult, setComparisonResult] = useState<any>(null)
  const [formData, setFormData] = useState<Partial<SimulationRequest>>({
    name: '',
    type: 'MONTE_CARLO',
    portfolioId: undefined,
    iterations: 10000,
    timeHorizon: 30,
    confidenceLevel: 0.95,
    distributionType: 'NORMAL',
  })

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: simulations, isLoading } = useQuery({
    queryKey: ['simulations', page],
    queryFn: () => simulationsApi.getAll(page, 10),
  })

  const { data: portfolios } = useQuery({
    queryKey: ['portfolios-all'],
    queryFn: () => portfoliosApi.getAll(0, 100),
  })

  const createMutation = useMutation({
    mutationFn: simulationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] })
      setShowModal(false)
      resetForm()
      alert('Simulation started successfully!')
    },
    onError: (error: any) => {
      console.error('Error creating simulation:', error)
      const message = error.response?.data?.message || error.message || 'Failed to start simulation'
      alert(`Error: ${message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: simulationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] })
    },
  })

  const compareMutation = useMutation({
    mutationFn: () => simulationsApi.compare(selectedForCompare),
    onSuccess: (data) => {
      setComparisonResult(data)
      setSelectedForCompare([])
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to compare simulations'}`)
    },
  })

  const handleExport = async (id: number, format: 'CSV' | 'JSON') => {
    try {
      const data = await simulationsApi.export(id, format)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `simulation-${id}.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Failed to export simulation'}`)
    }
  }

  const toggleCompareSelection = (id: number) => {
    setSelectedForCompare(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'MONTE_CARLO',
      portfolioId: undefined,
      iterations: 10000,
      timeHorizon: 30,
      confidenceLevel: 0.95,
      distributionType: 'NORMAL',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.portfolioId || formData.portfolioId === 0) {
      alert('Please select a portfolio')
      return
    }
    
    const requestData = formData as SimulationRequest
    console.log('Sending simulation request:', requestData)
    createMutation.mutate(requestData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'RUNNING': return 'bg-blue-100 text-blue-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Monte Carlo Simulations</h1>
        <div className="flex gap-2">
          {selectedForCompare.length >= 2 && (
            <button 
              onClick={() => compareMutation.mutate()} 
              className="btn btn-secondary flex items-center"
              disabled={compareMutation.isPending}
              title="Compare Simulations (UC-9)"
            >
              <GitCompare className="w-5 h-5 mr-2" />
              Compare ({selectedForCompare.length})
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Run Simulation
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="card">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedForCompare.length === simulations?.content.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedForCompare(simulations?.content.map(s => s.id) || [])
                        } else {
                          setSelectedForCompare([])
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {simulations?.content.map((simulation) => (
                  <tr key={simulation.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input 
                        type="checkbox"
                        checked={selectedForCompare.includes(simulation.id)}
                        onChange={() => toggleCompareSelection(simulation.id)}
                        disabled={simulation.status !== 'COMPLETED'}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{simulation.name}</td>
                    <td className="py-3 px-4">{simulation.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(simulation.status)}`}>
                        {simulation.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(simulation.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 flex gap-2">
                      {simulation.status === 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => navigate(`/simulations/${simulation.id}`)}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleExport(simulation.id, 'JSON')}
                            className="text-green-600 hover:text-green-800"
                            title="Export Data (UC-10)"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(simulation.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page + 1} of {simulations?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (simulations?.totalPages || 1) - 1}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Run New Simulation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Portfolio</label>
                <select
                  value={formData.portfolioId || ''}
                  onChange={(e) => setFormData({ ...formData, portfolioId: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value="">Select Portfolio</option>
                  {portfolios?.content.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Iterations</label>
                <input
                  type="number"
                  min="1000"
                  max="100000"
                  value={formData.iterations}
                  onChange={(e) => setFormData({ ...formData, iterations: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Time Horizon (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.timeHorizon}
                  onChange={(e) => setFormData({ ...formData, timeHorizon: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Confidence Level</label>
                <select
                  value={formData.confidenceLevel}
                  onChange={(e) => setFormData({ ...formData, confidenceLevel: parseFloat(e.target.value) })}
                  className="input"
                >
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
                </select>
              </div>

              <div>
                <label className="label">Distribution Type</label>
                <select
                  value={formData.distributionType}
                  onChange={(e) => setFormData({ ...formData, distributionType: e.target.value })}
                  className="input"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="LOGNORMAL">Log-Normal</option>
                  <option value="T_DISTRIBUTION">T-Distribution</option>
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Running...' : 'Run Simulation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {comparisonResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Simulation Comparison Results (UC-9)</h2>
            
            {comparisonResult.metricsComparison && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(comparisonResult.metricsComparison).map(([id, metrics]: [string, any]) => (
                    <div key={id} className="card border-2 border-primary-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">{metrics.name}</h3>
                        {comparisonResult.optimalSimulationId === parseInt(id) && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Optimal
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">VaR 95%</p>
                          <p className="text-lg font-bold text-red-600">${metrics.var95?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">VaR 99%</p>
                          <p className="text-lg font-bold text-red-700">${metrics.var99?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">CVaR 95%</p>
                          <p className="text-lg font-bold text-orange-600">${metrics.cvar95?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">CVaR 99%</p>
                          <p className="text-lg font-bold text-orange-700">${metrics.cvar99?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Expected Return</p>
                          <p className="text-lg font-bold text-green-600">{metrics.expectedReturn?.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Std Deviation</p>
                          <p className="text-lg font-bold">{metrics.standardDeviation?.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600 text-sm">Sharpe Ratio</p>
                          <p className="text-xl font-bold text-primary-600">{metrics.sharpeRatio?.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {comparisonResult.sensitivityAnalysis && (
                  <div className="card bg-blue-50">
                    <h3 className="text-lg font-bold mb-4">Sensitivity Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Risk Sensitivity</p>
                        <p className="text-lg font-bold">{(comparisonResult.sensitivityAnalysis.riskSensitivity * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Return Sensitivity</p>
                        <p className="text-lg font-bold">{(comparisonResult.sensitivityAnalysis.returnSensitivity * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {comparisonResult.insights && comparisonResult.insights.length > 0 && (
                  <div className="card bg-green-50">
                    <h3 className="text-lg font-bold mb-4">Key Insights</h3>
                    <ul className="space-y-2">
                      {comparisonResult.insights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => setComparisonResult(null)}
              className="btn btn-secondary w-full mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
