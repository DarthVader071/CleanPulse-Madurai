const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/leaderboard
// @desc    Get top users based on points
// @access  Public
router.get('/leaderboard', authController.getLeaderboard);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, authController.getProfile);

module.exports = router;
