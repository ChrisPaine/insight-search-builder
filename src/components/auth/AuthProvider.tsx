import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface Profile {
  id: string
  email: string
  full_name?: string
  subscription_status: 'free' | 'pro' | 'premium'
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<void>
  isPro: boolean
  isPremium: boolean
  isSupabaseConnected: boolean
  subscriptionStatus: {
    subscribed: boolean
    product_id: string | null
    subscription_end: string | null
  }
  checkSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean
    product_id: string | null
    subscription_end: string | null
  }>({ subscribed: false, product_id: null, subscription_end: null })
  
  const isSupabaseConnected = true

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        setTimeout(() => checkSubscription(), 0)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        setTimeout(() => checkSubscription(), 0)
      } else {
        setProfile(null)
        setSubscriptionStatus({ subscribed: false, product_id: null, subscription_end: null })
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data as Profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkSubscription = async () => {
    if (!session) return
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (error) {
        console.error('Error checking subscription:', error)
        return
      }
      
      setSubscriptionStatus(data)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSubscriptionStatus({ subscribed: false, product_id: null, subscription_end: null })
  }

  // Calculate subscription status - Pro product ID from Stripe
  const PRODUCT_IDS = {
    pro: 'prod_T4C8hI2HUGYMga',
    premium: null // Will add later
  }
  
  const isPro = subscriptionStatus.subscribed && subscriptionStatus.product_id === PRODUCT_IDS.pro
  const isPremium = subscriptionStatus.subscribed && subscriptionStatus.product_id === PRODUCT_IDS.premium

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
        signOut,
        isPro,
        isPremium,
        subscriptionStatus,
        checkSubscription,
    isSupabaseConnected,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}