const mongoose = require('mongoose');
const AdminUser = require('./src/models/AdminUser');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/family-blog';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const username = 'admin';
        const password = 'casapps2';

        const existing = await AdminUser.findOne({ username });
        if (existing) {
            console.log(`Admin user '${username}' already exists.`);
            // Optionally update password if needed, but for now just inform
            existing.password = password;
            await existing.save();
            console.log(`Password for '${username}' updated to match request.`);
        } else {
            await AdminUser.create({ username, password });
            console.log(`Admin user '${username}' created successfully.`);
        }

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
