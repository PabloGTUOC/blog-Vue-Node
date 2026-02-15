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
const AdminLoginView = () => import('../views/AdminLoginView.vue');
const AdminPostsView = () => import('../views/AdminPostsView.vue');
const AdminGalleriesView = () => import('../views/AdminGalleriesView.vue');
const AdminUsersView = () => import('../views/AdminUsersView.vue');
const AdminTagsView = () => import('../views/AdminTagsView.vue');
const AdminGalleryDetailView = () => import('../views/AdminGalleryDetailView.vue');

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
            path: '/admin/login',
            name: 'admin-login',
            component: AdminLoginView
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminDashboardView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/posts',
            name: 'admin-posts',
            component: AdminPostsView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/galleries',
            name: 'admin-galleries',
            component: AdminGalleriesView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/galleries/:id',
            name: 'admin-gallery-detail',
            component: AdminGalleryDetailView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/tags',
            name: 'admin-tags',
            component: AdminTagsView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/users',
            name: 'admin-users',
            component: AdminUsersView,
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
            if (!isAdmin) return next('/admin/login');
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
