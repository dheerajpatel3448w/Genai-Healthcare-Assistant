'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole } from '@/types'
import { apiClient } from '@/lib/api'
import { getCookie } from '@/lib/cookies'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = getCookie('authToken')
    if (token) {
      validateSession()
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateSession = async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me')
      setUser(response.user)
    } catch (error) {
      console.error('Session validation failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      })
      
      apiClient.setAuthToken(response.token)
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, fullName: string, role: UserRole) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/register', {
        email,
        password,
        fullName,
        role,
      })
      
      if (response.token) {
        apiClient.setAuthToken(response.token)
      }
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiClient.post('/auth/logout', {})
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiClient.clearAuthToken()
      setUser(null)
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
