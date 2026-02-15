const express = require('express');
const router = express.Router();
const AdminUser = require('../models/AdminUser');
const FamilyUser = require('../models/FamilyUser');
const requireAdmin = require('../middleware/requireAdmin');

// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    try {
        const admin = await AdminUser.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.adminId = admin._id;
        res.json({ message: 'Logged in successfully', username: admin.username });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Check Session
router.get('/me', requireAdmin, async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.session.adminId).select('-password');
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Initial Admin (Dev helper, remove or protect in prod)
router.post('/create-initial', async (req, res) => {
    const { username, password } = req.body;
    try {
        const exists = await AdminUser.findOne({ username });
        if (exists) return res.status(400).json({ message: 'Admin already exists' });

        const admin = await AdminUser.create({ username, password });
        res.status(201).json({ message: 'Admin created' });
    } catch (err) {
        res.status(501).json({ message: err.message });
    }
});

// --- User Approval Routes ---

// List all family users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await FamilyUser.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user status (approve/block)
router.put('/users/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'blocked', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const user = await FamilyUser.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
