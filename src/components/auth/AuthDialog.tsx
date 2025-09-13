import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const handleAuthRedirect = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Please sign in or create an account to access this feature.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAuthRedirect}
              className="flex-1 gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
            <Button 
              onClick={handleAuthRedirect}
              variant="outline" 
              className="flex-1 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Button>
          </div>
          
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Continue without account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};