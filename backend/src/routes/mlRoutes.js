const express = require('express');
const router = express.Router();
// Use the correct path for middleware, and comment it out if not needed globally right now.
// const { auth } = require('../middleware/authMiddleware');
const { predictHotspot } = require('../controllers/mlController');

// For testing purposes, we might not use auth right away, similar to complaintRoutes.
router.post('/predict-hotspot', predictHotspot);

module.exports = router;
