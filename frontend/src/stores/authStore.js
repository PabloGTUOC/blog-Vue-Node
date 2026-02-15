import { defineStore } from 'pinia';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: true,
        token: null, // Firebase ID Token
        googleAccessToken: localStorage.getItem('google_photos_token')
    }),
    actions: {
        async init() {
            return new Promise((resolve) => {
                onAuthStateChanged(auth, async (user) => {
                    this.user = user;
                    if (user) {
                        this.token = await user.getIdToken();
                        localStorage.setItem('familyToken', this.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                    } else {
                        this.token = null;
                        localStorage.removeItem('familyToken');
                        delete api.defaults.headers.common['Authorization'];
                    }
                    this.loading = false;
                    resolve(user);
                });
            });
        },
        async login() {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                // The signed-in user info.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                this.googleAccessToken = token;
                localStorage.setItem('google_photos_token', token);
            } catch (error) {
                console.error('Login failed', error);
                throw error;
            }
        },
        async logout() {
            await signOut(auth);
            this.user = null;
            this.token = null;
            this.googleAccessToken = null;
            localStorage.removeItem('google_photos_token');
        }
    }
});
