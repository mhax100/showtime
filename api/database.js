const { Pool } = require('pg');

// Database configuration that works with both individual env vars and DATABASE_URL
let poolConfig;

if (process.env.DATABASE_URL) {
  // Fly.io and many cloud providers set DATABASE_URL
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  };
} else {
  // Fall back to individual environment variables or defaults for local development
  poolConfig = {
    user: process.env.DB_USER || 'me',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'showtime_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  };
}

// Create a single pool instance to be shared across all modules
const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

module.exports = pool;