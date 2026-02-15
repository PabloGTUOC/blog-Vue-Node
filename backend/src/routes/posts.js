const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const requireAdmin = require('../middleware/requireAdmin');
const multer = require('multer');
const path = require('path');

// Multer Config for Posts
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/posts'));
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

// Get all posts (Admin list - includes drafts)
router.get('/admin', requireAdmin, async (req, res) => {
    try {
        const posts = await Post.find().populate('tags').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all published posts
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ isPublished: true })
            .populate('tags')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments({ isPublished: true });

        res.json({
            posts,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('tags');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Post (Admin)
router.post('/admin', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const data = { ...req.body };
        // Handle FormData strings
        if (data.isPublished === 'true') data.isPublished = true;
        if (data.isPublished === 'false') data.isPublished = false;

        // Handle tags from FormData (could be string or array)
        if (data.tags) {
            if (typeof data.tags === 'string') data.tags = [data.tags];
        } else if (data['tags[]']) {
            data.tags = Array.isArray(data['tags[]']) ? data['tags[]'] : [data['tags[]']];
        }

        if (req.file) {
            data.coverImage = `/uploads/posts/${req.file.filename}`;
        }
        const post = await Post.create(data);
        res.status(201).json(post);
    } catch (err) {
        console.error('Create Post Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update Post (Admin)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.isPublished === 'true') data.isPublished = true;
        if (data.isPublished === 'false') data.isPublished = false;

        // Handle tags from FormData
        if (data.tags) {
            if (typeof data.tags === 'string') data.tags = [data.tags];
        } else if (data['tags[]']) {
            data.tags = Array.isArray(data['tags[]']) ? data['tags[]'] : [data['tags[]']];
        }

        if (req.file) {
            data.coverImage = `/uploads/posts/${req.file.filename}`;
        }
        const post = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(post);
    } catch (err) {
        console.error('Update Post Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Delete Post (Admin)
// Delete Post (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Delete Cover Image if exists
        if (post.coverImage) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '..', post.coverImage);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
