import pg from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url'; // Import url module

const { Pool: PgPool } = pg; // Rename to avoid conflict

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: any; // Use 'any' for now to accommodate both types, or create a common interface
let testConnection: () => Promise<boolean>;

const dbPath = path.resolve(__dirname, '../local-dev.db'); // Path to root db file

if (process.env.NODE_ENV === 'production') {
  // Production: Use PostgreSQL
  console.log("Using PostgreSQL for production environment.");
  const pgPool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Assuming production always requires SSL
    }
  });

  pool = pgPool;

  testConnection = async () => {
    try {
      const client = await pgPool.connect();
      console.log("Successfully connected to PostgreSQL database");
      client.release();
      return true;
    } catch (error) {
      console.error("Error connecting to PostgreSQL database:", error);
      return false;
    }
  };

} else {
  // Development/Testing: Use SQLite
  console.log(`Using SQLite for development environment. DB Path: ${dbPath}`);
  const sqliteVerbose = sqlite3.verbose();
  const sqliteDb = new sqliteVerbose.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening SQLite database:", err.message);
    } else {
      console.log("Successfully connected to SQLite database.");
      // Optional: Create tables if they don't exist, etc.
      // sqliteDb.run("CREATE TABLE IF NOT EXISTS your_table (...)");
    }
  });

  // Create a compatible pool-like object for SQLite
  const sqlitePool = {
    // Mimic the query method - adjust parameters as needed for your app's usage
    query: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) {
            console.error("Error executing SQLite query:", err);
            reject(err);
          } else {
            // Mimic pg result structure if necessary, e.g., { rows: rows }
            resolve({ rows });
          }
        });
      });
    },
    // Mimic connect for testing purposes, though SQLite doesn't use pooling like pg
    connect: () => {
      // For SQLite, 'connecting' is essentially opening the file, which is done above.
      // We can return a mock client with a release function.
      console.log("SQLite 'connect' called (simulated).");
      return Promise.resolve({
        release: () => console.log("SQLite 'client' released (simulated).")
        // Add other methods if your app uses them on the client
      });
    },
    // Add other methods used by your application if needed
  };

  pool = sqlitePool;

  testConnection = async () => {
    // For SQLite, the connection is tested when the Database object is created.
    // We can perform a simple query to be sure.
    try {
      await sqlitePool.query('SELECT 1');
      console.log("Successfully executed test query on SQLite database.");
      return true;
    } catch (error) {
      console.error("Error testing SQLite connection:", error);
      return false;
    }
  };

  // Ensure the database is closed gracefully on exit
  process.on('SIGINT', () => {
    sqliteDb.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Closed the SQLite database connection.');
      process.exit(0);
    });
  });
}

export { pool, testConnection };