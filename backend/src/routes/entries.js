const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const multer = require('multer');
const path = require('path');
const requireApprovedFamily = require('../middleware/requireApprovedFamily');
const requireFamilyAuth = require('../middleware/requireFamilyAuth');
const axios = require('axios');
const fs = require('fs');
const exifr = require('exifr');

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

// Get entries for a gallery (Sorted by capture date, oldest first)
router.get('/gallery/:galleryId', async (req, res) => {
    try {
        const entries = await Entry.find({ gallery: req.params.galleryId }).sort({ dateTaken: 1, createdAt: 1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Route (For Bulk Uploads) - Moved up for clarity, though not strictly required if paths differ
const requireAdmin = require('../middleware/requireAdmin');
// Admin Route (For Bulk Uploads)
router.post('/admin', async (req, res, next) => {
    console.log('--- ADMIN UPLOAD ENTRY HIT ---');
    console.log('Headers:', req.headers['content-type']);
    next();
}, requireAdmin, upload.single('image'), async (req, res) => {
    console.log('--- INSIDE ADMIN UPLOAD HANDLER ---');
    try {
        if (!req.file) return res.status(400).json({ message: 'Image required' });

        const imageUrl = `/uploads/entries/${req.file.filename}`;

        const entry = await Entry.create({
            ...req.body,
            imageUrl,
            dateTaken: await (async () => {
                try {
                    const meta = await exifr.parse(req.file.path);
                    return meta?.DateTimeOriginal || null;
                } catch (e) { return null; }
            })()
        });

        res.status(201).json(entry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add Entry (Family Only) - Support Multiple
router.post('/', requireFamilyAuth, requireApprovedFamily, (req, res, next) => {
    // Explicit array handling with 'images' key
    upload.array('images', 100)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('SERVER MULTER ERROR:', err.message, 'Code:', err.code, 'Field:', err.field);
            return res.status(400).json({ message: `Gallery Upload Error (${err.code}): ` + err.message });
        } else if (err) {
            console.error('SERVER GENERAL UPLOAD ERROR:', err);
            return res.status(400).json({ message: 'General Upload Error: ' + err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        const entries = [];
        for (const file of req.files) {
            const imageUrl = `/uploads/entries/${file.filename}`;

            // Attempt to extract capture date
            let dateTaken = null;
            try {
                const meta = await exifr.parse(file.path);
                if (meta && meta.DateTimeOriginal) {
                    dateTaken = meta.DateTimeOriginal;
                    console.log(`Extracted date for ${file.originalname}: ${dateTaken}`);
                }
            } catch (e) {
                console.warn(`Failed EXIF for ${file.originalname}:`, e.message);
            }

            const entry = await Entry.create({
                ...req.body,
                imageUrl,
                title: req.body.title || file.originalname,
                dateTaken: dateTaken
            });
            entries.push(entry);
        }

        res.status(201).json(entries);
    } catch (err) {
        console.error('DATABASE SAVE ERROR:', err);
        res.status(500).json({ message: 'Database Error: ' + err.message });
    }
});

// Import from Google Photos
router.post('/import-google', requireFamilyAuth, requireApprovedFamily, async (req, res) => {
    try {
        const { items, galleryId, googleAccessToken } = req.body;
        if (!items || !items.length || !galleryId) {
            return res.status(400).json({ message: 'Missing items or gallery ID' });
        }

        const entries = [];
        const uploadDir = path.join(__dirname, '../uploads/entries');

        for (const item of items) {
            console.log(`Processing authorized download for: ${item.filename}`);
            if (!item.baseUrl) {
                console.error(`Item ${item.id} is missing baseUrl!`);
                continue;
            }

            // Append =w2048 to get a high-res version from Google baseUrl
            const downloadUrl = `${item.baseUrl}=w2048`;
            const filename = `google-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filepath = path.join(uploadDir, filename);

            try {
                const response = await axios({
                    url: downloadUrl,
                    method: 'GET',
                    responseType: 'stream',
                    headers: googleAccessToken ? { 'Authorization': `Bearer ${googleAccessToken}` } : {}
                });

                const writer = fs.createWriteStream(filepath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                const imageUrl = `/uploads/entries/${filename}`;
                const entry = await Entry.create({
                    gallery: galleryId,
                    imageUrl,
                    title: item.filename || 'Google Import',
                    description: item.description || '',
                    dateTaken: item.mediaMetadata?.creationTime ? new Date(item.mediaMetadata.creationTime) : null
                });
                console.log(`Successfully imported: ${item.filename} -> ${imageUrl}`);
                entries.push(entry);
            } catch (err) {
                console.error(`Failed to download/save item ${item.id || 'unknown'}:`, err.message);
                if (err.response) console.error('Google Download Error Data:', err.response.data);
                // Continue with next item
            }
        }

        res.status(201).json(entries);
    } catch (err) {
        console.error('Google Import Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Delete Entry (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        if (entry.imageUrl) {
            const filePath = path.join(__dirname, '..', entry.imageUrl);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { console.error('Delete File Error:', e); }
            }
        }
        await Entry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
