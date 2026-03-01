console.log("Complaint routes loaded WITHOUT auth");
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Check authentication for all complaint routes
router.use(authMiddleware);

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (Citizen, Admin, Worker)
router.post('/', upload.single('image_url'), complaintController.createComplaint);

// @route   GET /api/complaints
// @desc    Get all complaints (or own complaints if Citizen)
// @access  Private
router.get('/', complaintController.getComplaints);

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Admin, Worker)
router.put('/:id/status', roleMiddleware(['Admin', 'Worker']), complaintController.updateComplaintStatus);

module.exports = router;
