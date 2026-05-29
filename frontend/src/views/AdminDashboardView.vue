<script setup>
import { useSessionStore } from '../stores/sessionStore'
import { useRouter } from 'vue-router'

const sessionStore = useSessionStore()
const router = useRouter()

const logout = async () => {
    await sessionStore.adminLogout()
    router.push('/')
}
</script>

<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <p>Welcome, {{ sessionStore.adminUser?.username }}</p>
    
    <div class="nav-grid">
        <RouterLink to="/admin/posts" class="card">
            <h3>Manage Posts</h3>
            <p>Create, edit, delete blog posts.</p>
        </RouterLink>
        <RouterLink to="/admin/galleries" class="card">
            <h3>Gallery Archives</h3>
            <p>Classified storage for family and public photo collections.</p>
        </RouterLink>
        <RouterLink to="/admin/tags" class="card">
            <h3>Tag Taxonomy</h3>
            <p>Classify entries with retro-styled categorical metadata.</p>
        </RouterLink>
        <RouterLink to="/admin/users" class="card">
            <h3>User Clearance</h3>
            <p>Approve or revoke family member security clearance.</p>
        </RouterLink>
    </div>
    
    <button @click="logout" class="btn-logout">Logout</button>
  </div>
</template>

<style scoped>
.admin-dashboard {
    padding: 2rem 0;
}

h1 {
    color: var(--color-text);
    font-family: var(--font-display);
    margin-bottom: 1rem;
}

p {
    color: var(--color-secondary);
}

.nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.card {
    background: #FFFFFF;
    padding: 2.5rem;
    border: none;
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    position: relative;
}

.card::before {
    content: 'SYS_ADMIN';
    position: absolute;
    top: 15px;
    right: 15px;
    background: var(--color-primary);
    color: #FFFFFF;
    font-family: var(--font-ui);
    font-size: 0.65rem;
    padding: 4px 10px;
    letter-spacing: 1px;
    border-radius: 2px;
}

.card h3 {
    color: #1A1A1A;
    margin-bottom: 0.8rem;
    font-size: 1.4rem;
    font-family: var(--font-display);
}

.card p {
    color: var(--color-secondary);
    font-family: var(--font-ui);
    font-size: 0.9rem;
    line-height: 1.5;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--glow-primary);
}

.btn-logout {
    margin-top: 3rem;
}
</style>
