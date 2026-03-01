const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const mlRoutes = require('./routes/mlRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Database Tables
initDB();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ml', mlRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send('CleanPulse Madurai Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
