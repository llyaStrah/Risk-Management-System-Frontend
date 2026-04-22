import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '../../api/assetsApi'
import { portfoliosApi } from '../../api/portfoliosApi'
import { Plus, Trash2 } from 'lucide-react'
import { CreateAssetRequest } from '../../types'

export default function AssetsPage() {
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<CreateAssetRequest>({
    ticker: '',
    name: '',
    type: 'STOCK',
    quantity: 0,
    currentPrice: 0,
    portfolioId: 0,
  })

  const queryClient = useQueryClient()

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', page],
    queryFn: () => assetsApi.getAll(page, 10),
  })

  const { data: portfolios } = useQuery({
    queryKey: ['portfolios-all'],
    queryFn: () => portfoliosApi.getAll(0, 100),
  })

  const createMutation = useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setShowModal(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: assetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })

  const resetForm = () => {
    setFormData({
      ticker: '',
      name: '',
      type: 'STOCK',
      quantity: 0,
      currentPrice: 0,
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
        <h1 className="text-3xl font-bold text-gray-800">Assets</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Asset
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
                  <th className="text-left py-3 px-4">Ticker</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Total Value</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets?.content.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-primary-600">{asset.ticker}</td>
                    <td className="py-3 px-4">{asset.name}</td>
                    <td className="py-3 px-4">{asset.type}</td>
                    <td className="py-3 px-4">{asset.quantity}</td>
                    <td className="py-3 px-4">${asset.currentPrice?.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold">
                      ${(asset.quantity * asset.currentPrice).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteMutation.mutate(asset.id)}
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
              Page {page + 1} of {assets?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (assets?.totalPages || 1) - 1}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New Asset</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Ticker</label>
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                  className="input"
                  required
                />
              </div>

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
                <label className="label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="STOCK">Stock</option>
                  <option value="BOND">Bond</option>
                  <option value="COMMODITY">Commodity</option>
                  <option value="CRYPTO">Crypto</option>
                </select>
              </div>

              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Current Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) })}
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
                  {portfolios?.content.map((p) => (
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
