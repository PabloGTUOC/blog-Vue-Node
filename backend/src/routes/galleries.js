const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const requireAdmin = require('../middleware/requireAdmin');
const requireApprovedFamily = require('../middleware/requireApprovedFamily');
const requireFamilyAuth = require('../middleware/requireFamilyAuth');

// Get all galleries
router.get('/', async (req, res) => {
    try {
        const { family } = req.query;
        let query = { isFamilyOnly: false };

        // If requesting family galleries, verify auth (simplified check, real app would verify token here or rely on middleware if route was protected)
        // Actually, usually frontend sends token. But this is a public route that adapts.
        // For now, let's keep it simple: Public gets public. 
        // To see family, you need a different endpoint or pass token?
        // Let's make a separate route or middleware that attaches user if present?
        // Using query param is insecure for access control.
        // Better: /api/galleries/public and /api/galleries/family (protected)
        // Or just one endpoint that checks `req.user`?
        // I'll stick to: Public only sees public. Family route sees family.

        const galleries = await Gallery.find(query).populate('tags').sort({ createdAt: -1 });
        res.json(galleries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Specific Gallery
router.get('/:id', async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id) // Or findOne by slug
            .populate('tags');

        if (!gallery) return res.status(404).json({ message: 'Gallery not found' });

        if (gallery.isFamilyOnly) {
            // Check if user is authorized.
            // Since this is a generic get, it might be tricky.
            // I'll leave basic protection: if family only, frontend should use a protected route?
            // OR, I can check header here?
            // For now, if it's family only, I'll return 403 unless I implement optional auth.
            // Let's assume for now this endpoint is PUBLIC galleries.
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(gallery);
    } catch (err) {
        // Try slug
        try {
            const gallery = await Gallery.findOne({ name: req.params.id, isFamilyOnly: false }).populate('tags'); // name as slug approx
            if (gallery) return res.json(gallery);
        } catch (e) { }
        res.status(500).json({ message: 'Error' });
    }
});

// Family: Create Gallery
router.post('/', requireFamilyAuth, requireApprovedFamily, async (req, res) => {
    try {
        const gallery = await Gallery.create({
            ...req.body,
            isFamilyOnly: true // Force family only for family users?
        });
        res.status(201).json(gallery);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin: Create/Update/Delete (Full access)
router.post('/admin', requireAdmin, async (req, res) => {
    try {
        const gallery = await Gallery.create(req.body);
        res.status(201).json(gallery);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
