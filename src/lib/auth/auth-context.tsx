'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
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

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error.message, error.code)
        }
        setProfile(null)
      } else {
        setProfile(data as unknown as Profile)
      }
    } catch {
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }, [user, loadProfile])

  // Main auth initialization
  useEffect(() => {
    const supabase = createClient()
    let loadingTimeout: NodeJS.Timeout

    const getInitialSession = async () => {
      // Safety timeout: stop loading after 5s max
      loadingTimeout = setTimeout(() => {
        setIsLoading(false)
      }, 5000)

      try {
        // getSession() reads from local storage = instant, no server call
        const { data: { session }, error } = await supabase.auth.getSession()

        clearTimeout(loadingTimeout)

        if (error) {
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        setUser(session?.user ?? null)
        // Stop loading IMMEDIATELY - profile loads in background
        setIsLoading(false)

        if (session?.user) {
          // Load profile in background without blocking UI
          loadProfile(session.user.id)
        }
      } catch {
        clearTimeout(loadingTimeout)
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    // WICHTIG: Keine async Supabase-Calls in onAuthStateChange um Deadlock zu vermeiden!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          setUser(session?.user ?? null)
          // Profile wird im separaten useEffect geladen
        }

        setIsLoading(false)
      }
    )

    return () => {
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Separater useEffect: Profile laden wenn User sich ändert
  useEffect(() => {
    if (user && !profile) {
      loadProfile(user.id)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tab-Wechsel: Session refreshen mit refreshSession() (schneller als getUser())
  useEffect(() => {
    let isRefreshing = false
    const supabase = createClient()

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible' || isRefreshing) return
      isRefreshing = true

      try {
        // refreshSession() erneuert den Token ohne vollen Server-Roundtrip
        const { error } = await supabase.auth.refreshSession()

        if (error) {
          // Fallback: getUser() für Verifizierung
          await supabase.auth.getUser().catch(() => null)
        }
      } finally {
        isRefreshing = false
      }
    }

    // Auch bei focus-Event (Backup für visibilitychange)
    const handleFocus = async () => {
      if (isRefreshing) return
      isRefreshing = true

      try {
        await supabase.auth.getSession().catch(() => null)
      } finally {
        isRefreshing = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setIsLoading(false)

    const supabase = createClient()
    await supabase.auth.signOut()
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
