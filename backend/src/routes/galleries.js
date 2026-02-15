const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const requireAdmin = require('../middleware/requireAdmin');
const requireApprovedFamily = require('../middleware/requireApprovedFamily');
const requireFamilyAuth = require('../middleware/requireFamilyAuth');
const firebaseAdmin = require('../config/firebase');
const FamilyUser = require('../models/FamilyUser');
const Entry = require('../models/Entry');

const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Multer Config for Galleries
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/galleries'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});


// Get all galleries
router.get('/', async (req, res) => {
    try {
        let showFamily = false;

        // 1. Check for Admin Session
        if (req.session && req.session.adminId) {
            showFamily = true;
        }

        // 2. Check for Family Token if not already an admin
        if (!showFamily) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
                    const familyUser = await FamilyUser.findOne({ googleId: decodedToken.uid });
                    if (familyUser && familyUser.status === 'approved') {
                        showFamily = true;
                    }
                } catch (e) {
                    console.error('Firebase Token verification FAILED:', e.message);
                }
            }
        }

        const query = showFamily ? {} : { isFamilyOnly: false };
        const galleries = await Gallery.find(query).populate('tags').sort({ createdAt: -1 });
        res.json(galleries);
    } catch (err) {
        console.error('Check Galleries Error:', err);
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

// Get Specific Gallery (Keep existing)
router.get('/:id', async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id).populate('tags');
        if (!gallery) return res.status(404).json({ message: 'Gallery not found' });

        // Basic public access check logic
        if (gallery.isFamilyOnly) {
            // Ideally check req.user here, but for now we rely on frontend to guard sensitive pages
            // or this is just a metadata fetch.
        }
        res.json(gallery);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// Family: Create Gallery
router.post('/', requireFamilyAuth, requireApprovedFamily, upload.single('image'), async (req, res) => {
    try {
        const now = new Date();
        const data = {
            ...req.body,
            year: req.body.year || now.getFullYear(),
            month: req.body.month || (now.getMonth() + 1)
        };
        if (req.file) {
            data.coverImage = `/uploads/galleries/${req.file.filename}`;
        }
        data.isFamilyOnly = true;

        const gallery = await Gallery.create(data);
        res.status(201).json(gallery);
    } catch (err) {
        console.error('Family Create Gallery Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Multer Middleware Wrapper to handle errors
const uploadMiddleware = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('Multer Middleware Error:', err);
            return res.status(400).json({ message: 'File Upload Error: ' + err.message });
        }
        next();
    });
};

// Admin: Create Gallery (JSON Only)
router.post('/admin', requireAdmin, async (req, res) => {
    try {
        const { name, description, story, isFamilyOnly, tags, year, month } = req.body;

        if (!name || !year || !month) {
            return res.status(400).json({ message: 'Name, Year, and Month are required.' });
        }

        const gallery = await Gallery.create({
            name,
            description,
            story,
            isFamilyOnly: isFamilyOnly === true || isFamilyOnly === 'true',
            tags,
            year: Number(year),
            month: Number(month)
        });

        res.status(201).json(gallery);
    } catch (err) {
        console.error('Create Gallery JSON Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update Gallery (Unified for Admin and Approved Family)
router.put('/:id', requireFamilyAuth, requireApprovedFamily, async (req, res) => {
    try {
        const { name, description, story, isFamilyOnly, tags, year, month, coverImage } = req.body;

        // Basic Update Payload
        const updateData = {
            name,
            description,
            story,
            isFamilyOnly: isFamilyOnly === true || isFamilyOnly === 'true',
            tags,
            year: year ? Number(year) : undefined,
            month: month ? Number(month) : undefined,
            coverImage: coverImage // Allow manual cover setting
        };

        // Clean undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const gallery = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!gallery) return res.status(404).json({ message: 'Gallery not found' });

        res.json(gallery);
    } catch (err) {
        console.error('Update Gallery Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Admin: Upload Cover Image (Multipart)
router.post('/:id/cover', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });

        const coverImage = `/uploads/galleries/${req.file.filename}`;

        const gallery = await Gallery.findByIdAndUpdate(req.params.id, { coverImage }, { new: true });
        res.json(gallery);
    } catch (err) {
        console.error('Cover Upload Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Admin: Delete Gallery
// Admin: Delete Gallery (and associated entries/images)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) return res.status(404).json({ message: 'Gallery not found' });

        // 1. Delete Gallery Cover Image
        if (gallery.coverImage) {
            const coverPath = path.join(__dirname, '..', gallery.coverImage);
            if (fs.existsSync(coverPath)) {
                try { fs.unlinkSync(coverPath); } catch (e) { console.error('Failed to delete cover:', e); }
            }
        }

        // 2. Delete All Associated Entries (Images)
        const entries = await Entry.find({ gallery: gallery._id });
        for (const entry of entries) {
            if (entry.imageUrl) {
                const entryPath = path.join(__dirname, '..', entry.imageUrl);
                if (fs.existsSync(entryPath)) {
                    try { fs.unlinkSync(entryPath); } catch (e) { console.error('Failed to delete entry file:', e); }
                }
            }
        }
        await Entry.deleteMany({ gallery: gallery._id });

        // 3. Delete Gallery Document
        await Gallery.findByIdAndDelete(req.params.id);

        res.json({ message: 'Gallery and all associated files deleted' });
    } catch (err) {
        console.error('Delete Gallery Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
