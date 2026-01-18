const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed or similar. Actually I see bcrypt was discussed in readme but maybe I should use bcryptjs for easier install? I'll use bcryptjs if possible or just rely on 'bcrypt' I should install if not present. I'll check if I installed 'bcrypt' or 'bcryptjs'.
// I installed 'bcrypt' in the previous step? No, the plan said 'bcrypt' but I haven't added it to the install command unless I missed it?
// Ah, I installed 'express mongoose firebase-admin multer cors dotenv'. I did NOT install bcrypt.
// I should install bcrypt/bcryptjs. I'll use bcryptjs for ease.

const adminUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

adminUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

adminUserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
