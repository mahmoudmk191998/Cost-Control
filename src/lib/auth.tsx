import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from './supabase'

type AuthContextValue = {
  session: any | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession((data as any).session ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session ?? null)
      setLoading(false)
    })

    return () => {
      try {
        ;(listener as any)?.subscription?.unsubscribe()
      } catch (e) {}
      mounted = false
    }
  }, [])

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
