import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Backend URL changed to 5001
    withCredentials: true // Important for Admin session cookies
});

// Interceptor to add Firebase token to Family requests
api.interceptors.request.use(async (config) => {
    // We'll inject token if available in authStore, but circular dependency risk if we import store here directly?
    // Use a helper or just check localStorage if we stored it?
    // Better: Let the store handle token attachment or just set it on the instance when auth changes.
    // Or:
    // import { useAuthStore } from '../stores/authStore';
    // const authStore = useAuthStore();
    // if (authStore.token) config.headers.Authorization = `Bearer ${authStore.token}`;

    // To avoid circular dependency, we can inject it or let the component pass it. 
    // But cleaner is to let this service handle it.
    // We can lazy load the store.

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
