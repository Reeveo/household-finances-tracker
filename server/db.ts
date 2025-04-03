import pg from 'pg';

const { Pool: PgPool } = pg;

// Create a PostgreSQL pool for database connections
const pool = new PgPool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test connection to the database
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

// Ensure the database connection is closed gracefully on exit
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Closed the PostgreSQL database connection.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing PostgreSQL connection:', err);
    process.exit(1);
  }
});

export { pool, testConnection };