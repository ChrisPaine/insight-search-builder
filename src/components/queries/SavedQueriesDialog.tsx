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
import { Trash2, Search, Calendar } from 'lucide-react'
import { useQueries } from '@/hooks/useQueries'
import { useAuth } from '@/components/auth/AuthProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface SavedQueriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadQuery?: (queryData: any, platforms: string[]) => void
}

export const SavedQueriesDialog: React.FC<SavedQueriesDialogProps> = ({ 
  open, 
  onOpenChange, 
  onLoadQuery 
}) => {
  const { queries, loading, deleteQuery } = useQueries()
  const { user } = useAuth()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (queryId: string) => {
    setDeletingId(queryId)
    const success = await deleteQuery(queryId)
    if (success) {
      toast({
        title: 'Query deleted',
        description: 'Your saved query has been deleted.',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete query. Please try again.',
        variant: 'destructive',
      })
    }
    setDeletingId(null)
  }

  const handleLoadQuery = (query: any) => {
    if (onLoadQuery) {
      onLoadQuery(query.query_data, query.platforms)
      onOpenChange(false)
      toast({
        title: 'Query loaded',
        description: `"${query.title}" has been loaded into the search builder.`,
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saved Queries</DialogTitle>
          <DialogDescription>
            Load or manage your saved search queries.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : queries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No saved queries yet</h3>
              <p>Save your first query to see it here!</p>
            </div>
          ) : (
            queries.map((query) => (
              <Card key={query.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{query.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(query.created_at)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(query.id)}
                      disabled={deletingId === query.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {query.platforms.map((platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => handleLoadQuery(query)}
                    className="w-full"
                    variant="outline"
                  >
                    Load Query
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}