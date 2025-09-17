import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PaywallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
}

export const PaywallDialog: React.FC<PaywallDialogProps> = ({ open, onOpenChange, feature }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, session, isSupabaseConnected } = useAuth()
  const { toast } = useToast()

  // Check if Supabase is connected - for demo, show as feature preview
  if (!isSupabaseConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Premium Features Demo</DialogTitle>
            <DialogDescription>
              This is a demo of premium features. In a real deployment, 
              you would connect to Supabase and Stripe to enable subscriptions.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Premium features include:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Save unlimited queries</li>
              <li>• Advanced search operators</li>
              <li>• Export results to CSV</li>
              <li>• Team collaboration</li>
            </ul>
          </div>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="mt-4 w-full"
          >
            Close Demo Preview
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  const PRICE_IDS = {
    pro: 'price_1S83kOGVHdPbhL3jjHqKOaOL',
  }

  const plans = [
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      description: 'For ongoing market research & product development',
      useCase: 'Pro users save 10+ hours/month',
      features: [
        'Unlimited searches',
        'Save & organize queries (huge time-saver)',
        'Search history access',
        'Advanced platform operators',
        'Priority email support',
        'Cancel anytime, no questions asked',
      ],
      priceId: PRICE_IDS.pro,
      popular: true,
    },
  ]

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (error) {
        throw error
      }

      if (data?.url) {
        window.open(data.url, '_blank')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Upgrade to unlock {feature}</DialogTitle>
          <DialogDescription>
            Choose a plan that works for you and unlock advanced research capabilities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-w-md mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="text-center mb-2">{plan.description}</CardDescription>
                <p className="text-xs text-muted-foreground/80 italic">{plan.useCase}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full h-12 font-semibold"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}