import { useQuery } from '@tanstack/react-query'
import { portfoliosApi } from '../api/portfoliosApi'
import { risksApi } from '../api/risksApi'
import { simulationsApi } from '../api/simulationsApi'
import { Briefcase, TrendingUp, Activity, AlertTriangle } from 'lucide-react'

export default function DashboardPage() {
  const { data: portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => portfoliosApi.getAll(0, 5),
  })

  const { data: risks } = useQuery({
    queryKey: ['risks'],
    queryFn: () => risksApi.getAll(0, 5),
  })

  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => simulationsApi.getAll(0, 5),
  })

  const criticalRisks = risks?.content?.filter(r => r.level === 'CRITICAL' || r.level === 'HIGH')?.length || 0

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Portfolios</p>
              <p className="text-3xl font-bold text-gray-800">{portfolios?.totalElements || 0}</p>
            </div>
            <Briefcase className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Risks</p>
              <p className="text-3xl font-bold text-gray-800">{risks?.totalElements || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical Risks</p>
              <p className="text-3xl font-bold text-red-600">{criticalRisks}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Simulations</p>
              <p className="text-3xl font-bold text-gray-800">{simulations?.totalElements || 0}</p>
            </div>
            <Activity className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Portfolios</h2>
          <div className="space-y-3">
            {portfolios?.content?.slice(0, 5).map((portfolio) => (
              <div key={portfolio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{portfolio.name}</p>
                  <p className="text-sm text-gray-600">Created: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-lg font-bold text-primary-600">${portfolio.totalValue?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Risks</h2>
          <div className="space-y-3">
            {risks?.content?.slice(0, 5).map((risk) => (
              <div key={risk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{risk.name}</p>
                  <p className="text-sm text-gray-600">{risk.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  risk.level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  risk.level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  risk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {risk.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
