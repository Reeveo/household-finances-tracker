-- Migration: Enable Row Level Security on existing tables
BEGIN;

-- Enable RLS for Users Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can see all profiles (needed for UI displays)
CREATE POLICY "Users can view all profiles" 
ON public.users FOR SELECT 
TO authenticated
USING (true);

-- Users can only update their own profiles via the mapping
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE
USING (id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Enable RLS for Incomes Table
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own incomes
CREATE POLICY "Users can view own incomes" 
ON public.incomes FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own incomes" 
ON public.incomes FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own incomes" 
ON public.incomes FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own incomes" 
ON public.incomes FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Enable RLS for Expenses Table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own expenses
CREATE POLICY "Users can view own expenses" 
ON public.expenses FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own expenses" 
ON public.expenses FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own expenses" 
ON public.expenses FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

COMMIT; 