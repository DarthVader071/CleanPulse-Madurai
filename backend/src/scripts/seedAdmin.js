const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const seedAdmin = async () => {
    try {
        const email = 'admin@cleanpulse.com';
        const password = 'adminpassword123';
        const username = 'cleanpulse_admin'; // Using a more unique username
        const role = 'Admin';

        // Check if admin exists by email
        const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log('Admin user with this email already exists.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users(username, email, password_hash, role) VALUES($1, $2, $3, $4)',
            [username, email, passwordHash, role]
        );

        console.log('Default admin user created successfully.');
        console.log('Email: admin@cleanpulse.com');
        console.log('Username: cleanpulse_admin');
        console.log('Password: adminpassword123');
    } catch (err) {
        console.error('Error seeding admin:', err.message);
    }
};

if (require.main === module) {
    seedAdmin().then(() => process.exit());
}

module.exports = seedAdmin;
