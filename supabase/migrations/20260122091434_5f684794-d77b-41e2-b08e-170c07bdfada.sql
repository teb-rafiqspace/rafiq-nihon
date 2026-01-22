-- Add trial_used column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN trial_used boolean NOT NULL DEFAULT false;