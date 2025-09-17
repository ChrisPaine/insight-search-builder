import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, session, isPro, isPremium, subscriptionStatus } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const PRICE_IDS = {
    pro: 'price_1S83kOGVHdPbhL3jjHqKOaOL',
    premium: 'price_premium_monthly' // You'll need to create this in Stripe
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '10 searches per day',
        'Basic search queries',
        'Public templates',
        'Community support',
      ],
      priceId: null,
      popular: false,
      current: !isPro && !isPremium && !subscriptionStatus.subscribed,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      description: 'Perfect for researchers and professionals',
      features: [
        'Unlimited searches',
        'Advanced search operators',
        'Save & export queries',
        'All platform integrations',
        'Email support',
        'Premium templates',
      ],
      priceId: PRICE_IDS.pro,
      popular: true,
      current: isPro,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      description: 'For teams and agencies',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'API access',
        'Custom integrations',
        'Priority support',
        'Advanced analytics',
        'White-label options',
      ],
      priceId: PRICE_IDS.premium,
      popular: false,
      current: isPremium,
    },
  ]

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      })
      navigate('/auth')
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Research Tool
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock powerful social media research capabilities. Find customer pain points, 
            discover market opportunities, and build winning products with advanced search tools.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${plan.current ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              {plan.current && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period !== 'forever' && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
                <CardDescription className="text-center">{plan.description}</CardDescription>
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
                    'Get Started Free'
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-muted/30 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">🚀 Start discovering customer insights today</h3>
            <p className="text-muted-foreground mb-4">
              Join thousands of researchers, marketers, and founders who use our tool to find pain points and build better products.
            </p>
            <p className="text-sm text-muted-foreground">
              ✅ 14-day money-back guarantee • ✅ Cancel anytime • ✅ No setup fees
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}