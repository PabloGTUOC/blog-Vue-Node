const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    coverImage: {
        type: String // URL or path to the uploaded image
    },
    summary: {
        type: String
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

postSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Post', postSchema);
