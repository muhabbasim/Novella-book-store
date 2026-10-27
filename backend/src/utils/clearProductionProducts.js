import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load production environment from correct path
dotenv.config({ path: join(__dirname, '../../.env.production') });

// Force production environment
process.env.NODE_ENV = 'production';

// Create a separate pool for production operations
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearProductionProducts() {
  try {
    console.log('🗑️  Starting PRODUCTION database cleanup...');
    console.log('📊 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'unknown');

    // Check current count
    const beforeCount = await pool.query('SELECT COUNT(*) FROM products');
    const count = parseInt(beforeCount.rows[0].count);
    
    console.log(`📦 Found ${count} products in production database.`);

    if (count === 0) {
      console.log('✅ Database is already empty. Nothing to delete.');
      process.exit(0);
    }

    // Delete all products
    const result = await pool.query('DELETE FROM products');
    
    console.log(`✅ Successfully deleted ${result.rowCount} products from PRODUCTION database!`);
    console.log('🎯 Production database is now ready for fresh seeding.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing production database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearProductionProducts();
