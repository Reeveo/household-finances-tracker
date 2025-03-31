import fs from 'fs';
import path from 'path';
import { pool } from './db';
import { log } from './vite';

/**
 * Run all SQL migrations in order
 */
export async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get all migration files
    const migrationsDir = path.resolve(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order
    
    // Get already applied migrations
    const appliedMigrations = await pool.query('SELECT name FROM migrations');
    const appliedMigrationNames = appliedMigrations.rows.map(row => row.name);
    
    // Apply each migration that hasn't been applied yet
    for (const file of migrationFiles) {
      if (!appliedMigrationNames.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        // Read and execute the migration
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Use a transaction for each migration
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO migrations(name) VALUES($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration ${file} applied successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        } finally {
          client.release();
        }
      } else {
        console.log(`Migration ${file} already applied, skipping`);
      }
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Run database migrations for Supabase Auth integration
 */
export async function runSupabaseAuthMigrations() {
  try {
    // Create a migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Start a transaction for the migrations
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Auth mapping table migration
      const migrationName = 'create_auth_mapping_table';
      const migrationCheck = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migrationName]
      );
      
      if (migrationCheck.rows.length === 0) {
        log(`Applying migration: ${migrationName}`);
        
        // Create auth_mapping table
        await client.query(`
          CREATE TABLE IF NOT EXISTS auth_mapping (
            id SERIAL PRIMARY KEY,
            auth_id UUID NOT NULL UNIQUE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);
        
        // Add email index to users table if not exists
        try {
          await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
          `);
        } catch (indexError) {
          log(`Warning: Could not create email index: ${indexError}`);
        }
        
        // Record the migration
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migrationName]
        );
        
        log(`Migration ${migrationName} applied successfully`);
      } else {
        log(`Migration ${migrationName} already applied, skipping`);
      }
      
      // Add more migrations here as needed
      
      // Commit the transaction
      await client.query('COMMIT');
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    log(`Error applying migrations: ${error}`);
  }
} 