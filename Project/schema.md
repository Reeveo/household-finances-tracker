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
Stores user account information.

### Auth Mapping
```sql
CREATE TABLE IF NOT EXISTS auth_mapping (
  id SERIAL PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```
Maps Supabase Auth users to application users.

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
Manages user sessions with connect-pg-simple.

## Row Level Security (RLS)

The database implements Row Level Security policies to ensure data privacy:

- Each table has RLS enabled
- Users can only access their own data
- Shared access allows controlled data sharing between household members
- Auth mapping connects Supabase Auth with application users

## Entity Relationships

- Users own all financial data (incomes, expenses, budgets, etc.)
- Shared access creates relationships between household members
- All financial data has user_id as a foreign key to the users table
- Cascading deletes ensure referential integrity

## Database Migrations

Database schema is managed through migrations, which are applied when the application starts up or when schema changes are deployed.

## Authentication

Supabase Auth is used for authentication, with a custom auth_mapping table to connect Supabase Auth users with application users.
