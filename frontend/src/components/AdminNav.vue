<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="admin-nav-container">
    <nav class="admin-sub-nav">
      <RouterLink to="/admin">Dashboard</RouterLink>
      <RouterLink to="/admin/users">Users</RouterLink>
      <RouterLink to="/admin/posts">Posts</RouterLink>
      <RouterLink to="/admin/galleries">Galleries</RouterLink>
      <RouterLink to="/admin/tags">Tags</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.admin-nav-container {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-maroon);
  padding: 0.5rem 0;
}

.admin-sub-nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.admin-sub-nav a {
  font-family: var(--font-ui);
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  color: var(--color-text-dim);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.2s;
  position: relative;
}

.admin-sub-nav a:hover,
.admin-sub-nav a.router-link-active {
  color: var(--color-teal);
}

.admin-sub-nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-teal);
  box-shadow: 0 0 10px var(--color-teal);
}

@media (max-width: 768px) {
  .admin-sub-nav {
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .admin-sub-nav a {
    font-size: 0.7rem;
  }
}
</style>
