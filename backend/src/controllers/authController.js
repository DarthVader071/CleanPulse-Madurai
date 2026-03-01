const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        let user = await userModel.findByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await userModel.create(username, email, passwordHash, role || 'Citizen');

        // Create JWT
        const payload = {
            id: newUser.id,
            role: newUser.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user: newUser });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                const sanitizedUser = { id: user.id, username: user.username, email: user.email, role: user.role, points: user.points };
                res.json({ token, user: sanitizedUser });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await userModel.getLeaderboard(10);
        res.json(leaderboard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    register,
    login,
    getLeaderboard,
    getProfile
};
