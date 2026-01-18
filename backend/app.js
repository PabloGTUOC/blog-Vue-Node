const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/mongo');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

const session = require('express-session');
const { MongoStore } = require('connect-mongo');

// ... imports

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/family-blog',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Serve Static Files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes (Placeholders)
app.get('/', (req, res) => {
    res.send('Family Blog API Running');
});

// Import Routes
const adminRoutes = require('./src/routes/admin');
const familyRoutes = require('./src/routes/family');
const postsRoutes = require('./src/routes/posts');
const galleryRoutes = require('./src/routes/galleries');
const entryRoutes = require('./src/routes/entries');
const tagRoutes = require('./src/routes/tags');

app.use('/api/admin', adminRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/tags', tagRoutes);

module.exports = app;
