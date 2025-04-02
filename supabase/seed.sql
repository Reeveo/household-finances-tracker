-- Seed: Initial data setup
BEGIN;

-- Insert test users
INSERT INTO users (username, password, name, email) VALUES
('testuser1', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEF', 'Test User 1', 'test1@example.com'),
('testuser2', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEF', 'Test User 2', 'test2@example.com');

-- Insert test incomes
INSERT INTO incomes (user_id, name, amount, category, date, recurring, frequency, notes) VALUES
(1, 'Salary', 5000.00, 'Employment', NOW(), true, 'monthly', 'Monthly salary'),
(1, 'Freelance', 1000.00, 'Self-employed', NOW(), false, null, 'One-time project'),
(2, 'Salary', 4500.00, 'Employment', NOW(), true, 'monthly', 'Monthly salary');

-- Insert test expenses
INSERT INTO expenses (user_id, name, amount, category, subcategory, date, recurring, frequency, notes) VALUES
(1, 'Rent', 1500.00, 'Housing', 'Rent', NOW(), true, 'monthly', 'Monthly rent'),
(1, 'Groceries', 400.00, 'Food', 'Groceries', NOW(), true, 'monthly', 'Monthly groceries'),
(2, 'Utilities', 200.00, 'Housing', 'Utilities', NOW(), true, 'monthly', 'Monthly utilities');

-- Insert test budgets
INSERT INTO budgets (user_id, category, amount, month, year, notes) VALUES
(1, 'Housing', 2000.00, EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER, 'Monthly housing budget'),
(1, 'Food', 600.00, EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER, 'Monthly food budget'),
(2, 'Housing', 1800.00, EXTRACT(MONTH FROM NOW())::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER, 'Monthly housing budget');

-- Insert test savings goals
INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, category, notes) VALUES
(1, 'Emergency Fund', 10000.00, 5000.00, NOW() + INTERVAL '6 months', 'Emergency', 'Emergency fund goal'),
(1, 'Vacation', 3000.00, 1000.00, NOW() + INTERVAL '12 months', 'Travel', 'Vacation savings goal'),
(2, 'Down Payment', 20000.00, 10000.00, NOW() + INTERVAL '24 months', 'Housing', 'House down payment');

-- Insert test investments
INSERT INTO investments (user_id, name, amount, type, date, notes) VALUES
(1, 'Stock Portfolio', 10000.00, 'Stocks', NOW(), 'Stock market investments'),
(1, 'Retirement Fund', 20000.00, 'Retirement', NOW(), '401(k) contributions'),
(2, 'Mutual Fund', 15000.00, 'Mutual Funds', NOW(), 'Mutual fund investments');

-- Insert test transactions
INSERT INTO transactions (user_id, type, category, amount, date, description, recurring, frequency, notes) VALUES
(1, 'expense', 'Housing', 1500.00, NOW(), 'Monthly rent payment', true, 'monthly', 'Rent payment'),
(1, 'income', 'Employment', 5000.00, NOW(), 'Monthly salary', true, 'monthly', 'Salary deposit'),
(2, 'expense', 'Food', 150.00, NOW(), 'Grocery shopping', false, null, 'Weekly groceries');

-- Insert test shared access
INSERT INTO shared_access (owner_id, partner_id, access_level, status) VALUES
(1, 2, 'view', 'accepted');

-- Insert test invitations
INSERT INTO invitations (user_id, token, email, access_level, expires_at) VALUES
(1, 'test-token-123', 'test3@example.com', 'view', NOW() + INTERVAL '7 days');

COMMIT; 