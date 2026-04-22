/**
 * Декодирует JWT токен с правильной обработкой UTF-8 (кириллица)
 */
export function decodeJWT(token: string): any {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token provided to decodeJWT')
    return null
  }
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid JWT format')
      return null
    }
    
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    
    // Декодируем base64 в строку с правильной обработкой UTF-8
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Извлекает username из JWT токена
 */
export function getUsernameFromToken(token: string): string | null {
  const decoded = decodeJWT(token)
  return decoded?.sub || decoded?.username || null
}

/**
 * Извлекает email из JWT токена
 */
export function getEmailFromToken(token: string): string | null {
  const decoded = decodeJWT(token)
  return decoded?.email || null
}

/**
 * Извлекает роли из JWT токена
 */
export function getRolesFromToken(token: string): string[] {
  const decoded = decodeJWT(token)
  return decoded?.roles || decoded?.authorities || []
}
