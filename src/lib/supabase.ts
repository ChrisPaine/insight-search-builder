import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create Supabase client if environment variables are present
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Profile = {
  id: string
  email: string
  full_name?: string
  subscription_status: 'free' | 'pro' | 'premium' | 'enterprise' | 'admin'
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export type SavedQuery = {
  id: string
  user_id: string
  title: string
  query_data: any
  platforms: string[]
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: string
  price_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}