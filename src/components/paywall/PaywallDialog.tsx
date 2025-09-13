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
import { Check, Star } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

interface PaywallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
}

export const PaywallDialog: React.FC<PaywallDialogProps> = ({ open, onOpenChange, feature }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, isSupabaseConnected } = useAuth()

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

  const plans = [
    {
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      description: 'Perfect for researchers and small teams',
      features: [
        'Save unlimited queries',
        'Advanced search operators',
        'Export results to CSV',
        'Email support',
      ],
      priceId: 'price_pro_monthly', // You'll need to create this in Stripe
      popular: false,
    },
    {
      name: 'Premium',
      price: '$19.99',
      period: 'month',
      description: 'For agencies and enterprise users',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Priority support',
      ],
      priceId: 'price_premium_monthly', // You'll need to create this in Stripe
      popular: true,
    },
  ]

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Handle user not signed in
      return
    }

    setIsLoading(true)
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
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
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}