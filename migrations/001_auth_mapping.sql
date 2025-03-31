-- Migration: Add auth_mapping table for Supabase integration
BEGIN;

-- Create mapping table between Supabase Auth users and application users
CREATE TABLE IF NOT EXISTS auth_mapping (
  id SERIAL PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Auth Mapping Table
ALTER TABLE auth_mapping ENABLE ROW LEVEL SECURITY;

-- Users can only see their own mapping
CREATE POLICY "Users can view own mapping" 
ON auth_mapping FOR SELECT 
USING (auth_id = auth.uid());

-- Only service_role can insert/update mappings
CREATE POLICY "Service role can manage mappings" 
ON auth_mapping FOR ALL 
TO service_role
USING (true);

COMMIT; 