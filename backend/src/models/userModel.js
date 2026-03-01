const { query } = require('../config/db');

const userModel = {
    create: async (username, email, passwordHash, role = 'Citizen') => {
        const text = 'INSERT INTO users(username, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING id, username, email, role, points, created_at';
        const values = [username, email, passwordHash, role];
        const { rows } = await query(text, values);
        return rows[0];
    },

    findByEmail: async (email) => {
        const text = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await query(text, [email]);
        return rows[0];
    },

    findById: async (id) => {
        const text = 'SELECT id, username, email, role, points, created_at FROM users WHERE id = $1';
        const { rows } = await query(text, [id]);
        return rows[0];
    },

    getLeaderboard: async (limit = 10) => {
        const text = `
            SELECT u.id, u.username, u.points, COUNT(c.id) as "complaintsCount"
            FROM users u
            LEFT JOIN complaints c ON u.id = c.user_id
            WHERE u.role = $1
            GROUP BY u.id
            ORDER BY u.points DESC
            LIMIT $2
        `;
        const { rows } = await query(text, ['Citizen', limit]);
        return rows;
    },

    addPoints: async (id, pointsToAdd) => {
        const text = 'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING id, username, points';
        const { rows } = await query(text, [pointsToAdd, id]);
        return rows[0];
    }
};

module.exports = userModel;
