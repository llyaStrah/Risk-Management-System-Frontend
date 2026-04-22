import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function OAuth2RedirectPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      // Save token to store and localStorage
      setAuth(token, null) // User info will be fetched by the app
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true })
    } else {
      // No token, redirect to login
      navigate('/login', { replace: true })
    }
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
