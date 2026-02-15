import axios from 'axios';

const getBackendUrl = () => {
    // In production (when served by Nginx), use relative paths
    if (import.meta.env.PROD) {
        return '';
    }
    return 'http://localhost:5001';
};

export const BACKEND_URL = getBackendUrl();
const API_URL = `${BACKEND_URL}/api`;

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Request Interceptor: Attach token if available
client.interceptors.request.use(
    (config) => {
        // We can't use useAuthStore here directly because of Pinia initialization cycle.
        // Instead, we rely on the token being passed or stored in localStorage (if that's how it's done)
        // OR we try to access the store if possible.
        // A safer way: Check if token is in localStorage first
        // Assuming Pinia persists or simply reading from localStorage
        const token = localStorage.getItem('familyToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ... (interceptor code)

export default {
    // Expose defaults for Interceptors/AuthStore
    defaults: client.defaults,

    // --- Auth ---
    adminLogin(credentials) {
        return client.post('/admin/login', credentials);
    },
    adminLogout() {
        return client.post('/admin/logout');
    },
    getAdminSession() {
        return client.get('/admin/me');
    },
    getFamilySession() {
        return client.get('/family/me');
    },

    // --- Galleries ---
    getGalleries() {
        return client.get('/galleries');
    },
    getGallery(id) {
        return client.get(`/galleries/${id}`);
    },
    createGallery(data) {
        return client.post('/galleries/admin', data);
    },
    createFamilyGallery(data) {
        return client.post('/galleries', data);
    },
    updateGallery(id, data) {
        return client.put(`/galleries/${id}`, data);
    },
    deleteGallery(id) {
        return client.delete(`/galleries/${id}`);
    },
    uploadGalleryCover(id, formData) {
        return client.post(`/galleries/${id}/cover`, formData);
    },

    // --- Entries (Photos) ---
    getGalleryEntries(galleryId) {
        return client.get(`/entries/gallery/${galleryId}`);
    },
    uploadEntry(formData) {
        return client.post('/entries/admin', formData);
    },
    uploadFamilyEntry(formData) {
        return client.post('/entries', formData);
    },
    importGoogleEntries(data) {
        return client.post('/entries/import-google', data);
    },
    deleteEntry(id) {
        return client.delete(`/entries/${id}`);
    },

    // --- Posts ---
    getPosts(page = 1, limit = 5) {
        return client.get(`/posts?page=${page}&limit=${limit}`);
    },
    getAdminPosts() {
        return client.get('/posts/admin');
    },
    getPost(id) {
        return client.get(`/posts/${id}`);
    },
    createPost(formData) {
        return client.post('/posts/admin', formData);
    },
    updatePost(id, formData) {
        return client.put(`/posts/${id}`, formData);
    },
    deletePost(id) {
        return client.delete(`/posts/${id}`);
    },

    // --- Tags ---
    getTags() {
        return client.get('/tags');
    },
    createTag(data) {
        return client.post('/tags', data);
    },
    deleteTag(id) {
        return client.delete(`/tags/${id}`);
    },

    // --- Users ---
    getAdminUsers() {
        return client.get('/admin/users');
    },
    updateUserStatus(userId, status) {
        return client.put(`/admin/users/${userId}/status`, { status });
    }
};
