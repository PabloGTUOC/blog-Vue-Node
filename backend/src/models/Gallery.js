const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String
    },
    story: {
        type: String
    },
    coverImage: {
        type: String
    },
    isFamilyOnly: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['family', 'analog'],
        default: 'family'
    },
    camera: {
        type: String
    },
    film: {
        type: String
    },
    lab: {
        type: String
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', gallerySchema);
