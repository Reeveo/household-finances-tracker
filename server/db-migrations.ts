import { pool } from './db';

// SQL statements to create tables if they don't exist
const createTables = async () => {
  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create shared_access table
    await pool.query(`
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
    `);

    // Create invitations table
    await pool.query(`
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
    `);

    // Create incomes table
    await pool.query(`
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
    `);

    // Create expenses table
    await pool.query(`
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
    `);

    // Create budgets table
    await pool.query(`
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
    `);

    // Create savings_goals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        target_amount NUMERIC(10, 2) NOT NULL,
        current_amount NUMERIC(10, 2) DEFAULT 0,
        deadline TIMESTAMP WITH TIME ZONE,
        notes TEXT
      )
    `);

    // Create investments table
    await pool.query(`
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
    `);

    // Create session table for connect-pg-simple
    // This table is used to store session data
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);

    // Index on the expire column
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);

    // Commit transaction
    await pool.query('COMMIT');
    console.log('All tables created successfully');
    return true;
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error('Error creating tables:', error);
    return false;
  }
};

export { createTables };