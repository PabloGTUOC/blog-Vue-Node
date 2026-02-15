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
    color: var(--color-red);
    text-shadow: var(--glow-red);
}

.nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.card {
    background: var(--color-surface);
    padding: 2.5rem;
    border: var(--border-thickness) solid var(--color-red);
    text-decoration: none;
    transition: all 0.1s ease;
    box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
    position: relative;
}

.card::before {
    content: 'SYS_ADMIN';
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--color-red);
    color: #fff;
    font-family: var(--font-ui);
    font-size: 0.6rem;
    padding: 2px 6px;
    letter-spacing: 1px;
}

.card h3 {
    color: var(--color-red);
    margin-bottom: 0.8rem;
    font-size: 1.4rem;
}

.card p {
    color: var(--color-text-dim);
    font-family: var(--font-ui);
    font-size: 0.85rem;
    line-height: 1.4;
}

.card:hover {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0px 0px var(--color-blood);
    border-color: var(--color-yellow);
}

.btn-logout {
    margin-top: 3rem;
    border-color: var(--color-blood);
    color: var(--color-red);
}
</style>
