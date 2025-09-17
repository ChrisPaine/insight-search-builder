import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Crown, 
  Calendar, 
  TrendingUp, 
  Settings, 
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export const AccountPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { 
    user, 
    profile, 
    session,
    isPro, 
    isPremium, 
    isEnterprise,
    isAdmin,
    subscriptionStatus,
    checkSubscription 
  } = useAuth()
  const { 
    searchCount, 
    getRemainingSearches, 
    getUsagePercentage, 
    isLimited, 
    limit 
  } = useUsageLimit()
  const { toast } = useToast()

  const handleManageSubscription = async () => {
    if (!user || !session) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase!.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshSubscription = async () => {
    setIsLoading(true)
    try {
      await checkSubscription()
      toast({
        title: "Success",
        description: "Subscription status refreshed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh subscription status.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanName = () => {
    if (isEnterprise || isAdmin) return 'Enterprise'
    if (isPremium) return 'Premium'
    if (isPro) return 'Pro'
    return 'Free'
  }

  const getPlanColor = () => {
    if (isEnterprise || isAdmin) return 'bg-amber-500'
    if (isPremium) return 'bg-purple-500'
    if (isPro) return 'bg-primary'
    return 'bg-gray-500'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage statistics.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Email</span>
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            {profile?.full_name && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Name</span>
                <span className="text-muted-foreground">{profile.full_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Member since</span>
              <span className="text-muted-foreground">
                {profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Current Plan
              </div>
              <Badge className={getPlanColor()}>
                {getPlanName()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isPro || isPremium 
                ? 'You have access to all premium features.'
                : 'Upgrade to unlock unlimited searches and premium features.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionStatus.subscribed && subscriptionStatus.subscription_end && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Next billing date</span>
                <span className="text-muted-foreground">
                  {format(new Date(subscriptionStatus.subscription_end), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex gap-2">
              {subscriptionStatus.subscribed ? (
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => window.open('/pricing', '_self')}>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={handleRefreshSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh Status'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Usage Statistics
            </CardTitle>
            <CardDescription>
              {isLimited 
                ? `Track your monthly search usage (${limit} searches per month on Free plan)`
                : 'You have unlimited searches with your current plan'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLimited ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Searches this month</span>
                    <span>{searchCount} / {limit}</span>
                  </div>
                  <Progress value={getUsagePercentage()} className="w-full" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Remaining searches</span>
                  <Badge variant={getRemainingSearches() > 0 ? "secondary" : "destructive"}>
                    {getRemainingSearches()} left
                  </Badge>
                </div>
                
                {getRemainingSearches() <= 1 && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      You're running low on searches! Upgrade to Pro for unlimited searches.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-medium mb-2">Unlimited Usage</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy unlimited searches with your {getPlanName()} plan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}