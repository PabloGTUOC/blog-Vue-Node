<script setup>
import { ref, watch, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useSessionStore } from './stores/sessionStore'
import AdminNav from './components/AdminNav.vue'

const route = useRoute()
const authStore = useAuthStore()
const sessionStore = useSessionStore()
const mobileMenuOpen = ref(false)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const showAdminNav = computed(() => isAdminRoute.value && sessionStore.adminUser)

const toggleMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Prevent body scroll when menu is open
watch(mobileMenuOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div class="app-container" :class="{ 'menu-open': mobileMenuOpen }">
    <header>
      <div class="header-content">
        <RouterLink to="/" class="brand-logo">
          ENDER<span>THOUGHTS</span>
        </RouterLink>

        <button class="mobile-toggle" @click="toggleMenu" :aria-expanded="mobileMenuOpen">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <nav :class="{ 'nav-active': mobileMenuOpen }">
          <RouterLink to="/" @click="mobileMenuOpen = false">Home</RouterLink>
          <RouterLink to="/galleries" @click="mobileMenuOpen = false">Galleries</RouterLink>
          
          <template v-if="authStore.user">
            <RouterLink to="/family" @click="mobileMenuOpen = false">Family Area</RouterLink>
            <button class="nav-btn logout-btn" @click="authStore.logout(); mobileMenuOpen = false">Logout</button>
          </template>
          <template v-else>
            <button class="nav-btn login-btn" @click="authStore.login(); mobileMenuOpen = false">Login</button>
          </template>
        </nav>
      </div>
    </header>

    <AdminNav v-if="showAdminNav" />

    <main>
      <div class="container">
        <RouterView />
      </div>
    </main>

    <footer>
      <p>&copy; 2024 Enderthoughts | <RouterLink to="/admin">Admin Access</RouterLink></p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  padding: 1.5rem 0;
  border-bottom: 2px solid var(--color-blood);
  background: rgba(13, 2, 2, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 5px 20px rgba(0,0,0,0.5);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  font-family: var(--font-logo);
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -1px;
  color: transparent;
  -webkit-text-stroke: 1px var(--color-red);
  text-shadow: var(--glow-red);
  text-decoration: none;
  position: relative;
  display: inline-block;
  padding: 0.2rem 0;
}

/* Iconic horizontal bars */
.brand-logo::before,
.brand-logo::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-red);
  box-shadow: var(--glow-red);
}

.brand-logo::before { top: 0; }
.brand-logo::after { bottom: 0; }

.brand-logo span {
  font-weight: 200;
  color: var(--color-red);
  -webkit-text-stroke: 0;
}

@media (max-width: 480px) {
  .brand-logo {
    font-size: 1.6rem;
  }
}

nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

nav a {
  font-family: var(--font-ui);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-text-dim);
  text-decoration: none;
  transition: all 0.3s;
}

nav a:hover, nav a.router-link-active {
  color: var(--color-red);
  text-shadow: var(--glow-red);
}

.nav-btn {
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  font-family: var(--font-ui);
  margin-left: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

main {
  flex-grow: 1;
}

footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--color-maroon);
  font-size: 0.8rem;
  color: #666;
}

footer a { color: #888; }

/* Mobile Menu */
.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  border: none !important;
  background: none !important;
  padding: 10px;
  box-shadow: none !important;
  cursor: pointer;
  z-index: 2001; /* Must be higher than nav z-index */
  outline: none !important; /* Removes the blue focus ring */
  -webkit-tap-highlight-color: transparent; /* Removes the tap highlight on mobile */
}

.mobile-toggle:focus {
  outline: none !important;
}

.mobile-toggle:hover {
  transform: none !important;
  box-shadow: none !important;
}

.mobile-toggle .bar {
  width: 30px;
  height: 3px;
  background-color: var(--color-red);
  transition: 0.3s;
  border-radius: 2px;
}

.menu-open .mobile-toggle .bar:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-open .mobile-toggle .bar:nth-child(2) {
  opacity: 0;
}

.menu-open .mobile-toggle .bar:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

@media (max-width: 768px) {
  header {
    padding: 0.8rem 0;
    /* Remove backdrop-filter on mobile when menu is open to prevent stacking context clipping */
    backdrop-filter: none;
    background: rgba(13, 2, 2, 0.98);
  }

  .mobile-toggle { 
    display: flex;
    z-index: 3001;
  }
  
  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000000;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    gap: 1.5rem;
    transform: translateX(100%);
    transition: 0.3s cubic-bezier(0.77, 0, 0.175, 1);
    z-index: 3000;
    visibility: hidden;
  }

  nav.nav-active {
    transform: translateX(0);
    visibility: visible;
  }

  nav a {
    font-size: 1.25rem;
    width: 80%;
    text-align: center;
    padding: 1.2rem;
    color: var(--color-text);
    border-bottom: 1px solid rgba(255, 62, 68, 0.2);
  }

  nav a:last-of-type {
    border-bottom: none;
  }

  .nav-btn {
    font-size: 1.25rem;
    margin-left: 0;
    margin-top: 1.5rem;
    width: 80%;
    padding: 1rem;
    box-shadow: 4px 4px 0px 0px var(--color-maroon);
  }
}
</style>
