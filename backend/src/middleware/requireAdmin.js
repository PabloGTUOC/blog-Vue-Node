const requireAdmin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized: Admin access required' });
};

module.exports = requireAdmin;
