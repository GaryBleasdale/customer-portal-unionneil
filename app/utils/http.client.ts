import { useAuthStore } from '~/stores/auth.store'

export function getAuthHeaders() {
  // Only access the store if we're in the browser
  if (typeof window === 'undefined') return {}
  
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Helper to add auth headers to fetch requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    ...getAuthHeaders(),
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response
}
