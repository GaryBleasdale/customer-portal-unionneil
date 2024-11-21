import { create } from 'zustand'

type User = {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'CUSTOMER'
}

type AuthState = {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

// Create the store without persistence to avoid conflicts with server-side auth
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}))
