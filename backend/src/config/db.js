const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to initialize database schema dynamically if tables don't exist
const initDB = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Citizen',
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

   CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  waste_type VARCHAR(100),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'Pending',
  image_url TEXT,
  risk_score DECIMAL(5, 2),
  risk_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;
  try {
    const res = await pool.query(query);
    console.log('Database tables ensured.');

    // Seed default admin user
    const seedAdmin = require('../scripts/seedAdmin');
    await seedAdmin();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDB
};
