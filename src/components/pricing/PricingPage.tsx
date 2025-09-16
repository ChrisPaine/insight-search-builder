import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, session, isPro, subscriptionStatus } = useAuth()
  const { toast } = useToast()

  const PRICE_IDS = {
    pro: 'price_1S83kOGVHdPbhL3jjHqKOaOL',
    premium: null // Will add later
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 searches per month',
        'Basic search operators',
        'Public query templates',
        'Community support',
      ],
      priceId: null,
      popular: false,
      current: !isPro && !subscriptionStatus.subscribed,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      description: 'Perfect for researchers and professionals',
      features: [
        'Unlimited searches',
        'Advanced search operators',
        'Export results to CSV',
        'Search history & saved queries',
        'Email support',
        'Premium templates',
      ],
      priceId: PRICE_IDS.pro,
      popular: true,
      current: isPro,
    },
  ]

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase!.functions.invoke('create-checkout', {
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of pain point discovery with advanced features and unlimited access.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${plan.current ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            )}
            
            {plan.current && (
              <Badge className="absolute -top-2 right-4 bg-green-500">
                Current Plan
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <div className="text-right">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={isLoading || plan.current || !plan.priceId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : plan.current ? (
                  'Current Plan'
                ) : !plan.priceId ? (
                  'Free Forever'
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include a 7-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  )
}