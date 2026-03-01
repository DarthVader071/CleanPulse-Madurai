const { query } = require('../config/db');

const complaintModel = {
    create: async (userId, title, description, wasteType, lat, lng, imageUrl, riskScore, riskLevel) => {
        const text = `
      INSERT INTO complaints(
        user_id,
        title,
        description,
        waste_type,
        location_lat,
        location_lng,
        image_url,
        risk_score,
        risk_level
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

        const values = [userId, title, description, wasteType, lat, lng, imageUrl, riskScore, riskLevel];

        const { rows } = await query(text, values);
        return rows[0];
    },

    findAll: async () => {
        const text = `
            SELECT c.*, u.username 
            FROM complaints c 
            JOIN users u ON c.user_id = u.id 
            ORDER BY c.created_at DESC
        `;
        const { rows } = await query(text);
        return rows;
    },

    findByUserId: async (userId) => {
        const text = `
            SELECT c.*, u.username 
            FROM complaints c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.user_id = $1 
            ORDER BY c.created_at DESC
        `;
        const { rows } = await query(text, [userId]);
        return rows;
    },

    findById: async (id) => {
        const text = 'SELECT * FROM complaints WHERE id = $1';
        const { rows } = await query(text, [id]);
        return rows[0];
    },

    updateStatus: async (id, status) => {
        const text = 'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *';
        const { rows } = await query(text, [status, id]);
        return rows[0];
    },

    countNearbyComplaints: async (lat, lng, radiusDeg = 0.01) => {
        // Approximate: 0.01 degree is roughly 1km
        const text = `
            SELECT COUNT(*) 
            FROM complaints 
            WHERE location_lat BETWEEN $1 AND $2 
            AND location_lng BETWEEN $3 AND $4
        `;
        const values = [
            lat - radiusDeg,
            lat + radiusDeg,
            lng - radiusDeg,
            lng + radiusDeg
        ];
        const { rows } = await query(text, values);
        return parseInt(rows[0].count, 10);
    }
};

module.exports = complaintModel;
