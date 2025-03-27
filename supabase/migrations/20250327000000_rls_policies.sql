-- RLS Policies for Personal Finance Tracker

-- Enable RLS for Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Enable RLS for Transactions Table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" 
ON transactions FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" 
ON transactions FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" 
ON transactions FOR DELETE 
USING (user_id = auth.uid());

-- Enable RLS for Categories Table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own categories
CREATE POLICY "Users can view own categories" 
ON categories FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own categories" 
ON categories FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" 
ON categories FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" 
ON categories FOR DELETE 
USING (user_id = auth.uid());

-- Enable RLS for Accounts Table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own accounts
CREATE POLICY "Users can view own accounts" 
ON accounts FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own accounts" 
ON accounts FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts" 
ON accounts FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts" 
ON accounts FOR DELETE 
USING (user_id = auth.uid());

-- Enable RLS for Budgets Table
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own budgets
CREATE POLICY "Users can view own budgets" 
ON budgets FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own budgets" 
ON budgets FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets" 
ON budgets FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets" 
ON budgets FOR DELETE 
USING (user_id = auth.uid());

-- Enable RLS for Saved Calculations Table
ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;

-- Users can CRUD only their own saved calculations
CREATE POLICY "Users can view own saved calculations" 
ON saved_calculations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create own saved calculations" 
ON saved_calculations FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved calculations" 
ON saved_calculations FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own saved calculations" 
ON saved_calculations FOR DELETE 
USING (user_id = auth.uid()); 