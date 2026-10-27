// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '../config/database.js';

/**
 * Migration Script: Add Stripe payment columns to orders table
 * Run this script to update existing databases with Stripe integration support
 */
async function migrateStripeColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting Stripe columns migration...\n');
    
    await client.query('BEGIN');

    // Add payment_status column if it doesn't exist
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'
    `);
    console.log('✅ Added payment_status column');

    // Add stripe_session_id column if it doesn't exist
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255)
    `);
    console.log('✅ Added stripe_session_id column');

    // Add stripe_payment_intent_id column if it doesn't exist
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255)
    `);
    console.log('✅ Added stripe_payment_intent_id column');

    // Create index on stripe_session_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id 
      ON orders(stripe_session_id)
    `);
    console.log('✅ Created index on stripe_session_id');

    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNew columns added to orders table:');
    console.log('  - payment_status: Track payment state (pending, paid, failed, refunded)');
    console.log('  - stripe_session_id: Link to Stripe Checkout Session');
    console.log('  - stripe_payment_intent_id: Link to Stripe Payment Intent');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateStripeColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
