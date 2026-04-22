import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { risksApi } from '../../api/risksApi'
import { portfoliosApi } from '../../api/portfoliosApi'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { CreateRiskRequest } from '../../types'

export default function RisksPage() {
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showMetrics, setShowMetrics] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateRiskRequest>({
    name: '',
    description: '',
    type: 'MARKET',
    level: 'MEDIUM',
    probability: 0.5,
    impact: 0,
    portfolioId: 0,
  })

  const queryClient = useQueryClient()

  const { data: risks, isLoading } = useQuery({
    queryKey: ['risks', page],
    queryFn: () => risksApi.getAll(page, 10),
  })

  const { data: portfolios } = useQuery({
    queryKey: ['portfolios-all'],
    queryFn: () => portfoliosApi.getAll(0, 100),
  })

  const { data: metrics } = useQuery({
    queryKey: ['risk-metrics', showMetrics],
    queryFn: () => risksApi.getMetrics(showMetrics!),
    enabled: showMetrics !== null,
  })

  const createMutation = useMutation({
    mutationFn: risksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] })
      setShowModal(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: risksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'MARKET',
      level: 'MEDIUM',
      probability: 0.5,
      impact: 0,
      portfolioId: 0,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Risks</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Risk
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="card">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Probability</th>
                  <th className="text-left py-3 px-4">Impact</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {risks?.content?.map((risk) => (
                  <tr key={risk.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{risk.name}</td>
                    <td className="py-3 px-4">{risk.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        risk.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        risk.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        risk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">{(risk.probability * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4">${risk.impact?.toLocaleString()}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => setShowMetrics(risk.id)}
                        className="text-primary-600 hover:text-primary-800"
                        title="Calculate Risk Metrics (UC-1)"
                      >
                        <Calculator className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(risk.id)}
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
              Page {page + 1} of {risks?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (risks?.totalPages || 1) - 1}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showMetrics !== null && metrics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6">Risk Metrics (UC-1)</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card">
                <p className="text-gray-600 text-sm mb-1">Value at Risk (VaR)</p>
                <p className="text-2xl font-bold text-red-600">${metrics.valueAtRisk?.toFixed(2)}</p>
              </div>
              <div className="card">
                <p className="text-gray-600 text-sm mb-1">Conditional VaR (CVaR)</p>
                <p className="text-2xl font-bold text-red-700">${metrics.conditionalValueAtRisk?.toFixed(2)}</p>
              </div>
              <div className="card">
                <p className="text-gray-600 text-sm mb-1">Expected Loss</p>
                <p className="text-2xl font-bold text-orange-600">${metrics.expectedLoss?.toFixed(2)}</p>
              </div>
              <div className="card">
                <p className="text-gray-600 text-sm mb-1">Standard Deviation</p>
                <p className="text-2xl font-bold">{metrics.standardDeviation?.toFixed(2)}</p>
              </div>
              <div className="card">
                <p className="text-gray-600 text-sm mb-1">Beta</p>
                <p className="text-2xl font-bold">{metrics.beta?.toFixed(4)}</p>
              </div>
              <div className="card">
                <p className="text-gray-600 text-sm mb-1">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-primary-600">{metrics.sharpeRatio?.toFixed(4)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowMetrics(null)}
              className="btn btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New Risk</h2>
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
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div>
                <label className="label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="MARKET">Market</option>
                  <option value="CREDIT">Credit</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="LIQUIDITY">Liquidity</option>
                </select>
              </div>

              <div>
                <label className="label">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="label">Probability (0-1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Impact ($)</label>
                <input
                  type="number"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: parseFloat(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Portfolio</label>
                <select
                  value={formData.portfolioId}
                  onChange={(e) => setFormData({ ...formData, portfolioId: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value={0}>Select Portfolio</option>
                  {portfolios?.content?.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Create
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
    </div>
  )
}
