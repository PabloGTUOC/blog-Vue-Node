const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const multer = require('multer');
const path = require('path');
const requireApprovedFamily = require('../middleware/requireApprovedFamily');
const requireFamilyAuth = require('../middleware/requireFamilyAuth');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/entries'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Get entries for a gallery
router.get('/gallery/:galleryId', async (req, res) => {
    try {
        const entries = await Entry.find({ gallery: req.params.galleryId }).sort({ dateTaken: -1, createdAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Entry (Family/Admin)
router.post('/', requireFamilyAuth, requireApprovedFamily, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image required' });

        const imageUrl = `/uploads/entries/${req.file.filename}`;

        const entry = await Entry.create({
            ...req.body,
            imageUrl
        });

        res.status(201).json(entry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
