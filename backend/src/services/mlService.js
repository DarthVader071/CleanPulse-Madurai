const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

const mlService = {
    /**
     * Get hotspot prediction from ML service
     * @param {number} latitude 
     * @param {number} longitude 
     * @param {number} complaint_count 
     * @param {string} date (YYYY-MM-DD)
     * @returns {Promise<{risk_score: number, risk_level: string}>}
     */
    predictHotspot: async (latitude, longitude, complaint_count, date) => {
        try {
            const response = await axios.post(`${ML_API_URL}/predict`, {
                latitude,
                longitude,
                complaint_count,
                date
            });
            return response.data;
        } catch (error) {
            console.error('Error calling ML service:', error.message);
            // Return default/fallback values or rethrow depending on requirements
            return null;
        }
    }
};

module.exports = mlService;
