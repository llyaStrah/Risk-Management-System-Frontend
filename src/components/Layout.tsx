import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'
import { LayoutDashboard, TrendingUp, Briefcase, Activity, Package, LogOut, User, Users } from 'lucide-react'

export default function Layout() {
  const { username, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrentUser,
    retry: false,
  })

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || false

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">Risk Management</h1>
        </div>
        <nav className="mt-6">
          <Link to="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/portfolios" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
            <Briefcase className="w-5 h-5 mr-3" />
            Portfolios
          </Link>
          <Link to="/risks" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
            <TrendingUp className="w-5 h-5 mr-3" />
            Risks
          </Link>
          <Link to="/simulations" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
            <Activity className="w-5 h-5 mr-3" />
            Simulations
          </Link>
          <Link to="/assets" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
            <Package className="w-5 h-5 mr-3" />
            Assets
          </Link>
          <div className="border-t my-4"></div>
          <Link to="/profile" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          {isAdmin && (
            <Link to="/admin/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600">
              <Users className="w-5 h-5 mr-3" />
              Users (Admin)
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {username || 'User'}
            </h2>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
