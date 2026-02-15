const mongoose = require('mongoose');
require('dotenv').config();

const PostSchema = new mongoose.Schema({
    title: String,
    isPublished: Boolean,
    createdAt: Date
}, { strict: false });

const Post = mongoose.model('Post', PostSchema);

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/family-blog');
    const posts = await Post.find().sort({ createdAt: -1 }).limit(5);
    console.log('LATEST POSTS:');
    posts.forEach(p => console.log(`- ${p.title} (${p.createdAt}) [ID: ${p._id}, Published: ${p.isPublished}]`));
    process.exit();
}

check();
