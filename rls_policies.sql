-- RLS Policies for Personal Finance Tracker
BEGIN;

-- Create a mapping table between Supabase Auth users and our application users
CREATE TABLE IF NOT EXISTS auth_mapping (
  id SERIAL PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable RLS for Shared Access Table
ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- Users can view shared access where they are the owner or partner
CREATE POLICY "Users can view shared access" 
ON public.shared_access FOR SELECT 
USING (
  owner_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()) 
  OR 
  partner_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid())
);

-- Users can create shared access only as owner
CREATE POLICY "Users can create shared access" 
ON public.shared_access FOR INSERT 
WITH CHECK (owner_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Users can update shared access only as the involved parties
CREATE POLICY "Users can update shared access" 
ON public.shared_access FOR UPDATE 
USING (
  owner_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()) 
  OR 
  partner_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid())
);

-- Users can delete shared access only as owner
CREATE POLICY "Users can delete shared access" 
ON public.shared_access FOR DELETE 
USING (owner_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Enable RLS for Invitations Table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Users can view only their own invitations
CREATE POLICY "Users can view own invitations" 
ON public.invitations FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Users can create only their own invitations
CREATE POLICY "Users can create own invitations" 
ON public.invitations FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Users can update only their own invitations
CREATE POLICY "Users can update own invitations" 
ON public.invitations FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Users can delete only their own invitations
CREATE POLICY "Users can delete own invitations" 
ON public.invitations FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

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

-- Enable RLS for Budgets Table
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own budgets
CREATE POLICY "Users can view own budgets" 
ON public.budgets FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own budgets" 
ON public.budgets FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own budgets" 
ON public.budgets FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own budgets" 
ON public.budgets FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Enable RLS for Savings Goals Table
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own savings goals
CREATE POLICY "Users can view own savings goals" 
ON public.savings_goals FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own savings goals" 
ON public.savings_goals FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own savings goals" 
ON public.savings_goals FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own savings goals" 
ON public.savings_goals FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Enable RLS for Investments Table
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own investments
CREATE POLICY "Users can view own investments" 
ON public.investments FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own investments" 
ON public.investments FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own investments" 
ON public.investments FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own investments" 
ON public.investments FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Enable RLS for Transactions Table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own transactions" 
ON public.transactions FOR UPDATE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own transactions" 
ON public.transactions FOR DELETE 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

COMMIT; 