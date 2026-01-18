const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const requireAdmin = require('../middleware/requireAdmin');

// Get all tags
router.get('/', async (req, res) => {
    try {
        constTags = await Tag.find();
        res.json(constTags); // Typo fixed below
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create tag (Admin only)
router.post('/', requireAdmin, async (req, res) => {
    const { name, slug } = req.body;
    try {
        const tag = await Tag.create({ name, slug });
        res.status(201).json(tag);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
