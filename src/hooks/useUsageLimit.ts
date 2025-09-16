import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

const MONTHLY_SEARCH_LIMIT = 5

export const useUsageLimit = () => {
  const [searchCount, setSearchCount] = useState(0)
  const [lastReset, setLastReset] = useState<string | null>(null)
  const { user, isPro, isPremium } = useAuth()

  // Load usage data from localStorage
  useEffect(() => {
    if (!user) {
      setSearchCount(0)
      setLastReset(null)
      return
    }

    const saved = localStorage.getItem(`usage_${user.id}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const now = new Date()
        const resetDate = new Date(data.lastReset)
        
        // Reset count if it's a new month
        if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
          setSearchCount(0)
          const newResetDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
          setLastReset(newResetDate)
          localStorage.setItem(`usage_${user.id}`, JSON.stringify({
            searchCount: 0,
            lastReset: newResetDate
          }))
        } else {
          setSearchCount(data.searchCount || 0)
          setLastReset(data.lastReset)
        }
      } catch (error) {
        console.error('Error parsing usage data:', error)
        resetUsage()
      }
    } else {
      resetUsage()
    }
  }, [user])

  const resetUsage = () => {
    const now = new Date()
    const resetDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    setSearchCount(0)
    setLastReset(resetDate)
    if (user) {
      localStorage.setItem(`usage_${user.id}`, JSON.stringify({
        searchCount: 0,
        lastReset: resetDate
      }))
    }
  }

  const incrementSearchCount = () => {
    if (!user) return false

    // Pro/Premium users have unlimited searches
    if (isPro || isPremium) return true

    const newCount = searchCount + 1
    setSearchCount(newCount)
    
    if (lastReset) {
      localStorage.setItem(`usage_${user.id}`, JSON.stringify({
        searchCount: newCount,
        lastReset
      }))
    }

    return true
  }

  const canSearch = () => {
    // Pro/Premium users can always search
    if (isPro || isPremium) return true
    
    // Free users are limited to MONTHLY_SEARCH_LIMIT per month
    return searchCount < MONTHLY_SEARCH_LIMIT
  }

  const getRemainingSearches = () => {
    if (isPro || isPremium) return Infinity
    return Math.max(0, MONTHLY_SEARCH_LIMIT - searchCount)
  }

  const getUsagePercentage = () => {
    if (isPro || isPremium) return 0
    return Math.min(100, (searchCount / MONTHLY_SEARCH_LIMIT) * 100)
  }

  return {
    searchCount,
    canSearch,
    incrementSearchCount,
    getRemainingSearches,
    getUsagePercentage,
    isLimited: !isPro && !isPremium,
    limit: MONTHLY_SEARCH_LIMIT
  }
}