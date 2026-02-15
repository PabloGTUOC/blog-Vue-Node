const mongoose = require('mongoose');
require('dotenv').config();
const Gallery = require('./src/models/Gallery');
const FamilyUser = require('./src/models/FamilyUser');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/family-blog');
        console.log('Connected to DB');

        const galleries = await Gallery.find({});
        console.log('Total Galleries:', galleries.length);
        galleries.forEach(g => {
            console.log(`- ${g.name} (isFamilyOnly: ${g.isFamilyOnly}, year: ${g.year}, month: ${g.month})`);
        });

        const users = await FamilyUser.find({});
        console.log('Total Family Users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (status: ${u.status}, googleId: ${u.googleId})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
