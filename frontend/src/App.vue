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
  padding: 1rem 2rem;
  margin: 1.5rem auto;
  border-radius: var(--radius-pill);
  background: #111111;
  border: 2px solid var(--color-secondary);
  box-shadow: var(--glow-secondary), inset 0 0 10px rgba(0, 240, 255, 0.4);
  position: sticky;
  top: 1.5rem;
  z-index: 100;
  width: 90%;
  max-width: 1000px;
  box-sizing: border-box;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  font-family: var(--font-logo);
  font-size: 2.5rem;
  font-weight: 800;
  font-style: italic;
  letter-spacing: 2px;
  background: linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 40%, #FF007A 50%, #FF8A00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 3px rgba(255,0,122,0.8)) drop-shadow(2px 2px 0px rgba(0,240,255,0.8));
  text-decoration: none;
  position: relative;
  display: inline-block;
  padding: 0.2rem 0;
  transition: all 0.2s ease;
}

.brand-logo span {
  -webkit-text-fill-color: transparent;
}

.brand-logo:hover {
  transform: scale(1.02);
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
  font-family: var(--font-logo);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1.1rem;
  font-weight: normal;
  color: var(--color-secondary);
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
  text-decoration: none;
  transition: all 0.3s;
}

nav a:hover, nav a.router-link-active {
  color: #FFFFFF;
  text-shadow: 0 0 8px #FFFFFF, 0 0 15px var(--color-secondary);
}

.nav-btn {
  background: var(--color-primary);
  color: #1A1A1A;
  border: 2px solid var(--color-accent);
  font-family: var(--font-display);
  font-weight: bold;
  box-shadow: 2px 2px 0 var(--color-accent);
  border-radius: 4px;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  text-transform: uppercase;
}

.nav-btn:hover {
  background: var(--color-accent);
  color: var(--color-primary);
  box-shadow: 2px 2px 0 var(--color-primary);
  transform: translateY(-2px);
}

.container {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
  box-sizing: border-box;
}

main {
  flex-grow: 1;
}

footer {
  text-align: center;
  padding: 3rem 2rem 2rem 2rem;
  border-top: 1px solid var(--color-secondary);
  font-size: 0.8rem;
  color: var(--color-text);
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
  background-color: var(--color-primary);
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
    padding: 0.8rem 1.5rem;
    border-radius: var(--radius-pill);
    margin: 1rem auto;
    width: 90%;
    backdrop-filter: blur(10px);
    background: rgba(26, 26, 26, 0.95);
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
    background: var(--color-bg);
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
    border-bottom: 1px solid rgba(107, 112, 92, 0.2);
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
    box-shadow: none;
  }
}
</style>
