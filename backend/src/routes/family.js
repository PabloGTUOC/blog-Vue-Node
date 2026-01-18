const express = require('express');
const router = express.Router();
const requireFamilyAuth = require('../middleware/requireFamilyAuth');

// Get Current User (Upserts user if not exists via middleware)
router.get('/me', requireFamilyAuth, (req, res) => {
    res.json(req.familyUser);
});

module.exports = router;
