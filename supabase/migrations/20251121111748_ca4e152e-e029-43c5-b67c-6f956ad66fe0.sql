-- Add designs column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS designs jsonb NOT NULL DEFAULT '{}'::jsonb;