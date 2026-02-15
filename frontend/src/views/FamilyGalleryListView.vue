<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import GalleryGrid from '../components/GalleryGrid.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const galleries = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.getGalleries()
    galleries.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="family-area">
    <div class="welcome-banner">
      <div class="title-group">
        <h1>FAMILY ARCHIVES</h1>
        <p class="greeting">Welcome back, {{ authStore.user?.displayName }}</p>
      </div>
      <div class="actions">
         <RouterLink to="/family/galleries/new" class="btn-create">
            <span class="plus">+</span> CREATE NEW GALLERY
         </RouterLink>
      </div>
    </div>

    <div v-if="loading" class="state-msg">
        <p class="blink">FETCHING SECURE ARCHIVES...</p>
    </div>
    <div v-else-if="galleries.length === 0" class="state-msg">
        <h3>NO ARCHIVES FOUND</h3>
        <p>Your family vault is currently empty. Start by creating a new gallery!</p>
    </div>
    <div v-else>
        <h2 class="section-title">YOUR GALLERIES</h2>
        <GalleryGrid :galleries="galleries" />
    </div>
  </div>
</template>

<style scoped>
.family-area { padding: 3rem 2rem; max-width: 1000px; margin: 0 auto; }

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-maroon);
}

.title-group h1 { margin: 0; font-size: 2.5rem; }
.greeting { color: var(--color-teal); font-family: var(--font-ui); font-weight: bold; margin-top: 0.5rem; }

.section-title { margin-bottom: 2rem; font-size: 1.2rem; }

.state-msg {
    text-align: center;
    padding: 5rem 2rem;
    border: 2px dashed var(--color-maroon);
    border-radius: var(--radius-md);
    background: rgba(0,0,0,0.2);
}

.state-msg h3 { margin-bottom: 1rem; }
.state-msg p { color: var(--color-text-dim); }

.btn-create {
  background: var(--color-red);
  color: #fff;
  padding: 1rem 2rem;
  text-decoration: none;
  font-weight: 900;
  font-family: var(--font-ui);
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-maroon);
  transition: all 0.1s ease;
}

.btn-create:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px 0px var(--color-maroon);
  background: var(--color-blood);
}

.plus { font-size: 1.5rem; line-height: 1; }

@keyframes blink { 50% { opacity: 0.3; } }
.blink { animation: blink 1.5s infinite; color: var(--color-teal); font-weight: bold; letter-spacing: 2px; }

@media (max-width: 768px) {
    .welcome-banner { flex-direction: column; gap: 2rem; text-align: center; }
    .btn-create { width: 100%; justify-content: center; }
}
</style>
