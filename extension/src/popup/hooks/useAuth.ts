import { useState, useEffect } from 'react'
import { supabase, signIn as supabaseSignIn, signOut as supabaseSignOut, getCurrentUser } from '../../lib/supabase'
import type { User } from '../../types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Refresh user data
        getCurrentUser().then(setUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const user = await getCurrentUser()
      setUser(user)
    } catch (err) {
      console.error('Error checking user:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, pass: string) {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabaseSignIn(email, pass)
      if (error) throw error
      await checkUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    try {
      await supabaseSignOut()
      setUser(null)
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut
  }
}
