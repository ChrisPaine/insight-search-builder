import { useState, useEffect } from 'react'
import { supabase, type SavedQuery } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'

export const useQueries = () => {
  const [queries, setQueries] = useState<SavedQuery[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchQueries()
    } else {
      setQueries([])
      setLoading(false)
    }
  }, [user])

  const fetchQueries = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('saved_queries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching queries:', error)
      } else {
        setQueries(data || [])
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveQuery = async (title: string, queryData: any, platforms: string[]) => {
    if (!user || !supabase) return null

    try {
      const { data, error } = await supabase
        .from('saved_queries')
        .insert({
          user_id: user.id,
          title,
          query_data: queryData,
          platforms,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving query:', error)
        return null
      }

      setQueries([data, ...queries])
      return data
    } catch (error) {
      console.error('Error saving query:', error)
      return null
    }
  }

  const deleteQuery = async (queryId: string) => {
    if (!user || !supabase) return false

    try {
      const { error } = await supabase
        .from('saved_queries')
        .delete()
        .eq('id', queryId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting query:', error)
        return false
      }

      setQueries(queries.filter(q => q.id !== queryId))
      return true
    } catch (error) {
      console.error('Error deleting query:', error)
      return false
    }
  }

  return {
    queries,
    loading,
    saveQuery,
    deleteQuery,
    refetch: fetchQueries,
  }
}