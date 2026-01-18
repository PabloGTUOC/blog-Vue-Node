<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useSessionStore } from './stores/sessionStore'

const authStore = useAuthStore()
const sessionStore = useSessionStore()
</script>

<template>
  <div class="app-container">
    <header>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/galleries">Galleries</RouterLink>
        <span v-if="authStore.user">
           | <RouterLink to="/family">Family Area</RouterLink>
           <button @click="authStore.logout()">Logout</button>
        </span>
        <span v-else>
           <button @click="authStore.login()">Family Login</button>
        </span>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer>
      <p>&copy; 2024 Family Blog</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #121212; /* Dark background */
  color: #fff;
  font-family: 'Courier New', Courier, monospace; /* Retro font placeholder */
}

header {
  padding: 1rem;
  border-bottom: 2px solid #0ff; /* Neon cyan */
}

nav a {
  margin-right: 1rem;
  color: #0ff;
  text-decoration: none;
  text-transform: uppercase;
}

nav a:hover {
  text-shadow: 0 0 5px #0ff;
}
</style>
