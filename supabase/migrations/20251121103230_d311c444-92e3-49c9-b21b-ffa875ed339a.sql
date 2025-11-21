-- Add created_by and last_modified_by columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS created_by text NOT NULL DEFAULT 'divo',
ADD COLUMN IF NOT EXISTS last_modified_by text NOT NULL DEFAULT 'divo';