-- Update the check constraint to allow 'enterprise' and 'admin' values
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_subscription_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status = ANY (ARRAY['free'::text, 'pro'::text, 'premium'::text, 'enterprise'::text, 'admin'::text]));

-- Update your subscription status to enterprise
UPDATE public.profiles 
SET subscription_status = 'enterprise' 
WHERE email = 'chrislpaine@gmail.com';