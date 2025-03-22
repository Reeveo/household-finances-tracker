import pg from 'pg';
const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to PostgreSQL database");
    client.release();
    return true;
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    return false;
  }
};

export { pool, testConnection };