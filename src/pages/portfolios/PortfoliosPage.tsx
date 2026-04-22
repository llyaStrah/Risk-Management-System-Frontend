import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { portfoliosApi } from '../../api/portfoliosApi'
import { Plus, Trash2, Eye } from 'lucide-react'
import { CreatePortfolioRequest } from '../../types'

export default function PortfoliosPage() {
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<CreatePortfolioRequest>({
    name: '',
    totalValue: 0,
  })

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios', page],
    queryFn: () => portfoliosApi.getAll(page, 10),
  })

  const createMutation = useMutation({
    mutationFn: portfoliosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      setShowModal(false)
      setFormData({ name: '', totalValue: 0 })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: portfoliosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      alert('Portfolio deleted successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || ''
      
      if (errorMessage.includes('foreign key') || errorMessage.includes('внешнего ключа')) {
        alert(
          'Cannot delete portfolio!\n\n' +
          'This portfolio has related data (simulations, assets, or risks).\n' +
          'Please delete all related items first before deleting the portfolio.'
        )
      } else {
        alert(`Error: ${errorMessage || 'Failed to delete portfolio'}`)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleDelete = (portfolioId: number, portfolioName: string) => {
    if (window.confirm(`Are you sure you want to delete portfolio "${portfolioName}"?\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(portfolioId)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Portfolios</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Portfolio
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios?.content?.map((portfolio) => (
              <div key={portfolio.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{portfolio.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio.id, portfolio.name)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-bold text-primary-600">
                      ${portfolio.totalValue?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-800">
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
              Page {page + 1} of {portfolios?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (portfolios?.totalPages || 1) - 1}
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
            <h2 className="text-2xl font-bold mb-6">Add New Portfolio</h2>
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
                <label className="label">Total Value ($)</label>
                <input
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: '', totalValue: 0 })
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
