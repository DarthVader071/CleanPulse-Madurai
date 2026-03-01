const mlService = require('../services/mlService');

const predictHotspot = async (req, res) => {
    try {
        const { latitude, longitude, complaint_count, date } = req.body;

        if (!latitude || !longitude || complaint_count === undefined || !date) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const prediction = await mlService.predictHotspot(latitude, longitude, complaint_count, date);
        if (!prediction) {
            return res.status(503).json({ message: 'ML Service is currently unavailable' });
        }

        res.json(prediction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    predictHotspot
};
