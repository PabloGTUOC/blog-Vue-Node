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

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any localhost or local IP (192.168.x.x) during development
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isLocalIP = origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/);

        if (isLocalhost || isLocalIP || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        var msg = 'The CORS policy for this site does not ' +
            'allow access from the specified Origin: ' + origin;
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

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
        secure: false, // Changed to false to support HTTP local dev/NAS
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

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({
        message: 'Internal Server Error (Global)',
        error: err.message,
        stack: err.stack
    });
});

module.exports = app;
