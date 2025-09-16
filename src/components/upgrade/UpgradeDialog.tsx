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
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: string
}

export const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ 
  open, 
  onOpenChange, 
  reason = "unlock premium features" 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, session } = useAuth()
  const { toast } = useToast()

  const PRICE_IDS = {
    pro: 'price_1S83kOGVHdPbhL3jjHqKOaOL',
  }

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to Pro.",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase!.functions.invoke('create-checkout', {
        body: { priceId: PRICE_IDS.pro },
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Upgrade to {reason} and unlock unlimited potential.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                Pro Plan
                <Badge className="ml-2 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardTitle>
            <CardDescription>
              Perfect for researchers and professionals
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-2 mb-6">
              {[
                'Unlimited searches',
                'Advanced search operators',
                'Export results to CSV',
                'Search history & saved queries',
                'Email support',
                'Premium templates'
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade to Pro'
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              7-day money-back guarantee • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}