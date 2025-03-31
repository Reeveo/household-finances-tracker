import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';
import { comparePasswords } from './auth';
import { pool } from './db';
import 'dotenv/config';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

/**
 * Migrate all existing users to Supabase Auth
 */
async function migrateUsersToSupabase() {
  try {
    console.log('Starting user migration to Supabase...');
    
    // Get all users from our database
    const result = await pool.query('SELECT * FROM users');
    const users = result.rows;
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Create a mapping table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_mapping (
        id SERIAL PRIMARY KEY,
        auth_id UUID NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Process each user
    for (const user of users) {
      try {
        // Check if user is already mapped
        const mappingResult = await pool.query(
          'SELECT * FROM auth_mapping WHERE user_id = $1',
          [user.id]
        );
        
        if (mappingResult.rows.length > 0) {
          console.log(`User ${user.username} (ID: ${user.id}) already mapped, skipping`);
          continue;
        }
        
        // Create the user in Supabase Auth
        console.log(`Migrating user ${user.username} (ID: ${user.id})...`);
        
        // Option 1: Create user with admin privileges (will set password)
        const { data: supabaseUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email || `${user.username}@example.com`,
          password: 'TemporaryPassword123!', // Temporary password
          email_confirm: true,
        });
        
        if (error) {
          console.error(`Error creating Supabase user for ${user.username}:`, error);
          continue;
        }
        
        // Create mapping between Supabase Auth user and our user
        const authId = supabaseUser.user.id;
        await pool.query(
          'INSERT INTO auth_mapping (auth_id, user_id) VALUES ($1, $2)',
          [authId, user.id]
        );
        
        console.log(`Successfully migrated user ${user.username} (ID: ${user.id})`);
        
        // Option: Send password reset email to user
        await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: supabaseUser.user.email!,
        });
        
        console.log(`Password reset email sent to ${supabaseUser.user.email}`);
      } catch (userError) {
        console.error(`Error processing user ${user.username}:`, userError);
        // Continue with next user
      }
    }
    
    console.log('User migration completed!');
  } catch (error) {
    console.error('Error in migration process:', error);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateUsersToSupabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateUsersToSupabase }; 