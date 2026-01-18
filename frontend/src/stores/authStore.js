import { defineStore } from 'pinia';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: true,
        token: null
    }),
    actions: {
        async init() {
            return new Promise((resolve) => {
                onAuthStateChanged(auth, async (user) => {
                    this.user = user;
                    if (user) {
                        this.token = await user.getIdToken();
                        // Configure api header
                        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                    } else {
                        this.token = null;
                        delete api.defaults.headers.common['Authorization'];
                    }
                    this.loading = false;
                    resolve(user);
                });
            });
        },
        async login() {
            try {
                await signInWithPopup(auth, googleProvider);
            } catch (error) {
                console.error('Login failed', error);
                throw error;
            }
        },
        async logout() {
            await signOut(auth);
            this.user = null;
            this.token = null;
        }
    }
});
