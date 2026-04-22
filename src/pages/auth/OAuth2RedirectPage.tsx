import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { decodeJWT } from '../../utils/jwt'

export default function OAuth2RedirectPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      // Декодируем токен для получения информации о пользователе
      const decoded = decodeJWT(token)
      
      console.log('Decoded OAuth2 token:', decoded)
      
      if (decoded) {
        // OAuth2 провайдеры могут возвращать разные поля для имени
        const username = decoded.name || 
                        decoded.preferred_username || 
                        decoded.given_name || 
                        decoded.email?.split('@')[0] || 
                        decoded.username ||
                        'User'
        
        console.log('Extracted username:', username)
        console.log('Available fields:', Object.keys(decoded))
        
        // Сохраняем токен и информацию о пользователе
        setAuth({
          accessToken: token,
          refreshToken: token, // OAuth2 может не возвращать refresh token
          username: username,
          email: decoded.email || '',
          roles: decoded.roles || decoded.authorities || [],
        })
        
        // Перенаправляем на главную страницу
        navigate('/', { replace: true })
      } else {
        console.error('Failed to decode OAuth2 token')
        navigate('/login', { replace: true })
      }
    } else {
      // Нет токена, перенаправляем на логин
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
