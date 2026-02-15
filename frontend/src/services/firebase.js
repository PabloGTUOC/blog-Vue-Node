import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration:
const firebaseConfig = {
    apiKey: "AIzaSyCqmKnQwJvNntSvSwHce9ychb33MUzObNU",
    authDomain: "family-blog-50313.firebaseapp.com",
    projectId: "family-blog-50313",
    storageBucket: "family-blog-50313.firebasestorage.app",
    messagingSenderId: "886377955633",
    appId: "1:886377955633:web:b0cb2a33c59c961c573010",
    measurementId: "G-JXPMMT01GB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/photoslibrary');
googleProvider.addScope('https://www.googleapis.com/auth/photospicker.mediaitems.readonly');
googleProvider.setCustomParameters({ prompt: 'consent' });

export { auth, googleProvider };
