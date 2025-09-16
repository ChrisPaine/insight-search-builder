import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

const DAILY_SEARCH_LIMIT = 5

export const useUsageLimit = () => {
  const [searchCount, setSearchCount] = useState(0)
  const [lastReset, setLastReset] = useState<string | null>(null)
  const { user, isPro, isPremium } = useAuth()

  // Load usage data from localStorage (works for both anonymous and logged-in users)
  useEffect(() => {
    const storageKey = user ? `usage_${user.id}` : 'usage_anonymous'
    const saved = localStorage.getItem(storageKey)
    
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const now = new Date()
        const resetDate = new Date(data.lastReset)
        
        // Reset count if it's a new day
        if (now.toDateString() !== resetDate.toDateString()) {
          const newResetDate = new Date().toISOString()
          setSearchCount(0)
          setLastReset(newResetDate)
          localStorage.setItem(storageKey, JSON.stringify({
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
    const now = new Date().toISOString()
    setSearchCount(0)
    setLastReset(now)
    const storageKey = user ? `usage_${user.id}` : 'usage_anonymous'
    localStorage.setItem(storageKey, JSON.stringify({
      searchCount: 0,
      lastReset: now
    }))
  }

  const incrementSearchCount = () => {
    // Pro/Premium users have unlimited searches
    if (user && (isPro || isPremium)) return true

    const newCount = searchCount + 1
    setSearchCount(newCount)
    
    const storageKey = user ? `usage_${user.id}` : 'usage_anonymous'
    if (lastReset) {
      localStorage.setItem(storageKey, JSON.stringify({
        searchCount: newCount,
        lastReset
      }))
    }

    return true
  }

  const canSearch = () => {
    // Pro/Premium users can always search
    if (user && (isPro || isPremium)) return true
    
    // Free users (including anonymous) are limited to DAILY_SEARCH_LIMIT per day
    return searchCount < DAILY_SEARCH_LIMIT
  }

  const getRemainingSearches = () => {
    if (user && (isPro || isPremium)) return Infinity
    return Math.max(0, DAILY_SEARCH_LIMIT - searchCount)
  }

  const getUsagePercentage = () => {
    if (user && (isPro || isPremium)) return 0
    return Math.min(100, (searchCount / DAILY_SEARCH_LIMIT) * 100)
  }

  return {
    searchCount,
    canSearch,
    incrementSearchCount,
    getRemainingSearches,
    getUsagePercentage,
    isLimited: !(user && (isPro || isPremium)),
    limit: DAILY_SEARCH_LIMIT
  }
}