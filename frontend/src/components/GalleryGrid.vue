<script setup>
import { RouterLink } from 'vue-router'
import { BACKEND_URL } from '../services/api'

defineProps({
  galleries: {
    type: Array,
    required: true
  }
})

const getCoverUrl = (path) => {
    if (!path) return '/placeholder.jpg'
    if (path.startsWith('http')) return path
    return `${BACKEND_URL}${path}`
}

const getMonthName = (m) => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return months[m - 1] || m;
}
</script>

<template>
  <div class="gallery-grid">
    <div v-for="gallery in galleries" :key="gallery._id" class="gallery-card">
      <div class="card-date" v-if="gallery.year">
          <span class="m">{{ getMonthName(gallery.month) }}</span>
          <span class="y">{{ gallery.year }}</span>
      </div>
      <div class="cover-image" :style="{ backgroundImage: `url(${getCoverUrl(gallery.coverImage)})` }"></div>
      <div class="info">
        <h3>{{ gallery.name }}</h3>
        <p>{{ gallery.description }}</p>
        <RouterLink :to="`/galleries/${gallery._id}`" class="btn">View Gallery</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
}

.gallery-card {
  background: var(--color-surface);
  border: 2px solid var(--color-maroon);
  overflow: hidden;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  position: relative;
  box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-maroon);
}

.gallery-card:hover {
  transform: translate(-4px, -4px);
  border-color: var(--color-red);
  box-shadow: calc(var(--hard-shadow-offset) + 4px) calc(var(--hard-shadow-offset) + 4px) 0px 0px var(--color-blood);
}

.card-date {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(4px);
  color: var(--color-text);
  padding: 6px 10px;
  border: 1px solid var(--color-maroon);
  border-radius: var(--radius-sm);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.card-date .m {
    font-family: var(--font-ui);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 1px;
    color: var(--color-teal);
    margin-bottom: 2px;
}

.card-date .y {
    font-family: monospace;
    font-size: 0.8rem;
    font-weight: bold;
}

.cover-image {
  height: 220px;
  background-size: cover;
  background-position: center;
  background-color: #000;
  border-bottom: 2px solid var(--color-blood);
}

.info {
  padding: 1.8rem;
}

h3 {
  margin: 0 0 0.8rem 0;
  color: var(--color-red);
  font-family: var(--font-display);
  font-size: 1.4rem;
}

p {
  color: var(--color-text-dim);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.8rem;
  height: 2.8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.btn {
  display: inline-block;
  color: #fff;
  background: var(--color-surface);
  text-decoration: none;
  border: 1px solid var(--color-teal);
  border-radius: var(--radius-sm);
  padding: 0.7rem 1.2rem;
  font-family: var(--font-ui);
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.1s ease;
  box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-maroon);
}

.btn:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px 0px var(--color-maroon);
  background: var(--color-teal);
  color: #000;
}
</style>
