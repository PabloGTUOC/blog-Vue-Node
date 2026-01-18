const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
// You need to set GOOGLE_APPLICATION_CREDENTIALS in .env pointing to your service account key file
// Or provide the service account object directly if you prefer (less secure in code, use env vars)

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(), // Uses GOOGLE_APPLICATION_CREDENTIALS env var
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

module.exports = admin;
