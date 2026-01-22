-- Drop old constraint and add new one with premium option
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_type_check 
  CHECK (plan_type = ANY (ARRAY['free'::text, 'monthly'::text, 'annual'::text, 'premium'::text, 'yearly'::text]));