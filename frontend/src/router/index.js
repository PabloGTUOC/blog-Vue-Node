import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';

const HomeView = () => import('../views/HomeView.vue');
const GalleryListView = () => import('../views/GalleryListView.vue');
const GalleryDetailView = () => import('../views/GalleryDetailView.vue');
const BlogDetailView = () => import('../views/BlogDetailView.vue'); // Placeholder import
const FamilyGalleryListView = () => import('../views/FamilyGalleryListView.vue');
const FamilyGalleryCreateView = () => import('../views/FamilyGalleryCreateView.vue');
const AdminDashboardView = () => import('../views/AdminDashboardView.vue');

// For now, empty component to run
const Placeholder = { template: '<div>Placeholder</div>' };

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/galleries',
            name: 'galleries',
            component: GalleryListView
        },
        {
            path: '/galleries/:id',
            name: 'gallery-detail',
            component: GalleryDetailView
        },
        {
            path: '/blog/:id',
            name: 'blog-detail',
            component: BlogDetailView
        },
        {
            path: '/admin',
            name: 'admin',
            name: 'admin',
            component: AdminDashboardView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/family',
            name: 'family',
            component: FamilyGalleryListView,
            meta: { requiresAuth: true }
        },
        {
            path: '/family/galleries/new',
            name: 'family-gallery-create',
            component: FamilyGalleryCreateView,
            meta: { requiresAuth: true }
        }
        // Add more routes later
    ]
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const sessionStore = useSessionStore();

    // If loading, wait? Or app should wait.
    // We assume authStore.init() is called in main.js

    if (to.meta.requiresAdmin) {
        if (!sessionStore.adminUser) {
            const isAdmin = await sessionStore.checkAdminSession();
            if (!isAdmin) return next('/'); // Or admin login
        }
    }

    if (to.meta.requiresAuth) {
        if (!authStore.user) {
            return next('/');
        }
    }

    next();
});

export default router;
