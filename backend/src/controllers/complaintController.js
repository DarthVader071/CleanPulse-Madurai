const axios = require('axios');
const complaintModel = require('../models/complaintModel');
const userModel = require('../models/userModel');
const mlService = require('../services/mlService');

const createComplaint = async (req, res) => {
    try {
        const { title, description, location_lat, location_lng, latitude, longitude } = req.body;

        console.log("Incoming request body:", req.body);

        const lat = parseFloat(location_lat || latitude || 9.9252);
        const lng = parseFloat(location_lng || longitude || 78.1198);
        const finalImage = req.file ? `/uploads/${req.file.filename}` : '';

        console.log("Calling ML...");

        // Get local complaint count
        const complaintCount = await complaintModel.countNearbyComplaints(lat, lng);

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Fetch prediction from ML Service
        const prediction = await mlService.predictHotspot(lat, lng, complaintCount, today);
        const riskScore = prediction ? prediction.risk_score : null;
        const riskLevel = prediction ? prediction.risk_level : null;

        console.log("Inserting into DB...");

        const newComplaint = await complaintModel.create(
            req.user ? req.user.id : 1, // Fallback for testing mode
            title || 'Waste Hotspot',
            description,
            lat,
            lng,
            finalImage,
            riskScore,
            riskLevel
        );

        res.status(201).json(newComplaint);

    } catch (err) {
        console.error(err.stack);
        res.status(500).send('Server error');
    }
};

const getComplaints = async (req, res) => {
    try {
        let complaints;

        // 🔥 If no authentication (testing mode)
        if (!req.user) {
            complaints = await complaintModel.findAll();
        }
        // Admins and Workers see all complaints
        else if (req.user.role === 'Admin' || req.user.role === 'Worker') {
            complaints = await complaintModel.findAll();
        }
        // Citizens see only their own complaints
        else {
            complaints = await complaintModel.findByUserId(req.user.id);
        }

        res.json(complaints);
    } catch (err) {
        console.error(err.stack);
        res.status(500).send('Server error');
    }
};
const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body; // e.g., 'In Progress', 'Resolved'
        const complaintId = req.params.id;

        const complaint = await complaintModel.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const updatedComplaint = await complaintModel.updateStatus(complaintId, status);

        // If a complaint is resolved, award points to the citizen who reported it
        if (status === 'Resolved' && complaint.status !== 'Resolved') {
            // Award 10 points for a resolved complaint
            await userModel.addPoints(complaint.user_id, 10);
        }

        res.json(updatedComplaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    createComplaint,
    getComplaints,
    updateComplaintStatus
};
