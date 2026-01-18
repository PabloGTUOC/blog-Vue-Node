const admin = require('../config/firebase');
const FamilyUser = require('../models/FamilyUser');

const requireFamilyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Check/Create Family User in DB
        let familyUser = await FamilyUser.findOne({ googleId: req.user.uid });
        if (!familyUser) {
            familyUser = await FamilyUser.create({
                email: req.user.email,
                name: req.user.name || 'Unknown',
                googleId: req.user.uid,
                status: 'pending'
            });
        }
        req.familyUser = familyUser;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = requireFamilyAuth;
