const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/vishnu/Desktop/Smart and Green Madurai city/backend/.env' });

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

async function check() {
    try {
        const res = await pool.query('SELECT username, email, role FROM users');
        console.log('Existing Users:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error checking users:', err.message);
    } finally {
        await pool.end();
    }
}
check();
