const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const requireAdmin = require('../middleware/requireAdmin');

// Get all published posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true }).populate('tags').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('tags');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (!post.isPublished) { // TODO: Allow admin to see draft
            // For now, simpler check
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create Post (Admin)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const post = await Post.create(req.body);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Post (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Post (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
