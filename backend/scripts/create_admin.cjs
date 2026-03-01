const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'c:/Users/vishnu/Desktop/Smart and Green Madurai city/backend/.env' });

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

async function createAdmin() {
    const username = 'admin';
    const email = 'admin@madurai.gov.in';
    const password = 'admin123';
    const role = 'Admin';

    try {
        // Check if exists
        const checkRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log('Admin already exists.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const text = 'INSERT INTO users(username, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING id';
        const values = [username, email, passwordHash, role];

        const res = await pool.query(text, values);
        console.log(`Successfully created admin user with ID: ${res.rows[0].id}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error('Error creating admin:', err.message);
    } finally {
        await pool.end();
    }
}

createAdmin();
