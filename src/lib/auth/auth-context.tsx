'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isApproved: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message, error.code, error.details)
      setProfile(null)
    } else {
      setProfile(data as unknown as Profile)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const supabase = createClient()

    // Use getUser() for secure server-verified session
    const initAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)
        if (authUser) {
          await fetchProfile(authUser.id)
        }
      } catch {
        setUser(null)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          return
        }

        if (session?.user) {
          setUser(session.user)

          // Only fetch profile on initial sign-in or token refresh
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            await fetchProfile(session.user.id)
          }
        }

        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Refresh session when tab becomes visible again
  useEffect(() => {
    let refreshing = false

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible' || refreshing) return
      refreshing = true

      try {
        const supabase = createClient()
        const { data: { user: refreshedUser }, error } = await supabase.auth.getUser()

        if (error || !refreshedUser) {
          if (user) {
            setUser(null)
            setProfile(null)
          }
          return
        }

        setUser(refreshedUser)
        await fetchProfile(refreshedUser.id)
      } finally {
        refreshing = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, fetchProfile])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isApproved = profile?.is_approved ?? false
  const isAdmin = profile?.is_admin ?? false

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isApproved,
        isAdmin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
