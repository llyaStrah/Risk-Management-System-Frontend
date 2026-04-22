import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { simulationsApi } from '../../api/simulationsApi'
import { ArrowLeft } from 'lucide-react'

export default function SimulationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: simulation, isLoading } = useQuery({
    queryKey: ['simulation', id],
    queryFn: () => simulationsApi.getById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!simulation) {
    return <div className="text-center py-12">Simulation not found</div>
  }

  const results = simulation.result

  return (
    <div>
      <button
        onClick={() => navigate('/simulations')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Simulations
      </button>

      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{simulation.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Type</p>
            <p className="text-lg font-medium text-gray-800">{simulation.type}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-lg font-medium text-gray-800">{simulation.status}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Started</p>
            <p className="text-lg font-medium text-gray-800">
              {new Date(simulation.startedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-lg font-medium text-gray-800">
              {simulation.completedAt ? new Date(simulation.completedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {results && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">VaR (95%)</p>
              <p className="text-2xl font-bold text-red-600">${results.var95?.toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">VaR (99%)</p>
              <p className="text-2xl font-bold text-red-700">${results.var99?.toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">CVaR (95%)</p>
              <p className="text-2xl font-bold text-orange-600">${results.cvar95?.toLocaleString()}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">CVaR (99%)</p>
              <p className="text-2xl font-bold text-orange-700">${results.cvar99?.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Return:</span>
                  <span className="font-bold text-green-600">{results.expectedReturn?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Standard Deviation:</span>
                  <span className="font-bold text-gray-800">{results.standardDeviation?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sharpe Ratio:</span>
                  <span className="font-bold text-primary-600">{results.sharpeRatio?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Drawdown:</span>
                  <span className="font-bold text-red-600">${results.maxDrawdown?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Simulation Parameters</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Iterations:</span>
                  <span className="font-bold text-gray-800">
                    {simulation.iterations?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Horizon:</span>
                  <span className="font-bold text-gray-800">{simulation.timeHorizon} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence Level:</span>
                  <span className="font-bold text-gray-800">
                    {(simulation.confidenceLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Portfolio ID:</span>
                  <span className="font-bold text-gray-800">{simulation.portfolioId}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {simulation.status !== 'COMPLETED' && (
        <div className="card">
          <p className="text-gray-600 text-center">
            Simulation is {simulation.status.toLowerCase()}. Results will be available once completed.
          </p>
        </div>
      )}
    </div>
  )
}
