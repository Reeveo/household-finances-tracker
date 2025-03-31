# Household Finances Tracker - Database Schema

This document outlines the database schema for the Household Finances Tracker application, which uses Supabase (PostgreSQL) as its database.

## Core Tables

### Users
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```
Stores user account information. The `password` field is used for legacy authentication during the migration period, and will eventually be phased out as all users migrate to Supabase Auth.

### Auth Mapping
```sql
CREATE TABLE IF NOT EXISTS auth_mapping (
  id SERIAL PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```
Maps Supabase Auth users to application users. This table plays a crucial role in the authentication system:
- `auth_id`: The UUID of the user in Supabase Auth
- `user_id`: The ID of the user in our application's users table
- Creates a one-to-one relationship between Supabase Auth users and application users
- Enables a smooth transition from session-based auth to JWT-based auth
- Allows preserving user data during the authentication migration

## Financial Data Tables

### Incomes
```sql
CREATE TABLE IF NOT EXISTS incomes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(50),
  notes TEXT
)
```
Tracks all income sources for users.

### Expenses
```sql
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(50),
  notes TEXT
)
```
Records user expenses with categorization.

### Budgets
```sql
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  amount NUMERIC(10, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  UNIQUE(user_id, category, subcategory, month, year)
)
```
Defines budget allocations by category per month.

### Savings Goals
```sql
CREATE TABLE IF NOT EXISTS savings_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL,
  current_amount NUMERIC(10, 2) DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  notes TEXT
)
```
Tracks savings goals and progress.

### Investments
```sql
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  initial_amount NUMERIC(10, 2) NOT NULL,
  current_value NUMERIC(10, 2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  interest_rate NUMERIC(5, 2),
  notes TEXT
)
```
Records investment information and performance.

## Collaboration Tables

### Shared Access
```sql
CREATE TABLE IF NOT EXISTS shared_access (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level VARCHAR(50) NOT NULL DEFAULT 'view',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  invite_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  accepted_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id, partner_id)
)
```
Manages household member access sharing.

### Invitations
```sql
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  access_level VARCHAR(50) NOT NULL DEFAULT 'view',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
```
Handles user invitations for household sharing.

## Session Management

```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
)
```
Manages user sessions with connect-pg-simple. This table is used for legacy session-based authentication during the migration period and will eventually be phased out.

## Row Level Security (RLS)

The database implements Row Level Security policies to ensure data privacy:

- Each table has RLS enabled
- Users can only access their own data through Supabase Auth policies
- Shared access allows controlled data sharing between household members
- Auth mapping connects Supabase Auth with application users

### Example RLS Policies

For the transactions table:
```sql
-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));

-- Users can only insert transactions linked to their user ID
CREATE POLICY "Users can create own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (user_id IN (SELECT user_id FROM auth_mapping WHERE auth_id = auth.uid()));
```

## Entity Relationships

- Users own all financial data (incomes, expenses, budgets, etc.)
- Shared access creates relationships between household members
- All financial data has user_id as a foreign key to the users table
- Cascading deletes ensure referential integrity
- Auth mapping provides the bridge between Supabase Auth and application users

## Database Migrations

Database schema is managed through migrations, which are applied when the application starts up or when schema changes are deployed. The application has two migration systems:

1. **SQL Migrations**: Applied through the `run-migrations.ts` script
2. **Supabase Auth Migrations**: Applied through the `supabase-migrations.ts` script

## Authentication

The application uses a dual authentication system during the migration period:

1. **Supabase Auth**: JWT-based authentication is the primary and recommended method
   - Uses Supabase Auth for user management
   - Implements JWT token verification
   - Maps Supabase Auth users to application users via the auth_mapping table

2. **Legacy Session Auth**: Session-based authentication for backward compatibility
   - Uses Passport.js with local strategy
   - Stores sessions in the database
   - Will be phased out once all users migrate to Supabase Auth

### User Migration Process

The application includes a migration script (`migrate-users-to-supabase.ts`) to:
1. Create Supabase Auth users for existing application users
2. Create mappings in the auth_mapping table
3. Send password reset emails to users for setting up their new credentials
4. Maintain backward compatibility through the dual-auth system

### Auth Flow

1. User authenticates with Supabase Auth
2. JWT token is verified on API requests
3. Auth mapping middleware maps the Supabase user to an application user
4. Request proceeds with the mapped user ID
5. Row Level Security ensures data privacy
