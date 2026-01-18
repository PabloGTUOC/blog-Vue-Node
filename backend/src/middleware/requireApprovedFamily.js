const requireApprovedFamily = (req, res, next) => {
    if (!req.familyUser) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    if (req.familyUser.status === 'approved') {
        return next();
    }

    return res.status(403).json({ message: 'Forbidden: Account pending approval' });
};

module.exports = requireApprovedFamily;
