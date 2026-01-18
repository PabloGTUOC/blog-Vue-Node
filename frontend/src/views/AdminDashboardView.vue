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
        <div class="card">
            <h3>Manage Posts</h3>
            <p>Create, edit, delete blog posts.</p>
        </div>
        <div class="card">
            <h3>Manage Galleries</h3>
            <p>Oversee all photo galleries.</p>
        </div>
        <div class="card">
            <h3>Users</h3>
            <p>Approve family members.</p>
        </div>
    </div>
    
    <button @click="logout" style="margin-top: 2rem; border-color: red; color: red;">Logout</button>
  </div>
</template>

<style scoped>
.admin-dashboard {
    padding: 2rem;
}

.nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.card {
    background: #222;
    padding: 1.5rem;
    border: 1px solid #444;
}
</style>
