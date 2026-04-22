import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OAuth2RedirectPage from './pages/auth/OAuth2RedirectPage'
import DashboardPage from './pages/DashboardPage'
import RisksPage from './pages/risks/RisksPage'
import PortfoliosPage from './pages/portfolios/PortfoliosPage'
import PortfolioDetailsPage from './pages/portfolios/PortfolioDetailsPage'
import SimulationsPage from './pages/simulations/SimulationsPage'
import SimulationDetailsPage from './pages/simulations/SimulationDetailsPage'
import AssetsPage from './pages/assets/AssetsPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/risks" element={isAuthenticated ? <RisksPage /> : <Navigate to="/login" />} />
          <Route path="/portfolios" element={isAuthenticated ? <PortfoliosPage /> : <Navigate to="/login" />} />
          <Route path="/portfolios/:id" element={isAuthenticated ? <PortfolioDetailsPage /> : <Navigate to="/login" />} />
          <Route path="/simulations" element={isAuthenticated ? <SimulationsPage /> : <Navigate to="/login" />} />
          <Route path="/simulations/:id" element={isAuthenticated ? <SimulationDetailsPage /> : <Navigate to="/login" />} />
          <Route path="/assets" element={isAuthenticated ? <AssetsPage /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
