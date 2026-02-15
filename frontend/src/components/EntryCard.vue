<script setup>
import { BACKEND_URL } from '../services/api'
defineProps({
  entry: {
    type: Object,
    required: true
  }
})

// Helper to resolve image URL
const getImageUrl = (url) => {
  if (url.startsWith('http')) return url
  return `${BACKEND_URL}${url}`
}
</script>

<template>
  <div class="entry-card">
    <img :src="getImageUrl(entry.imageUrl)" :alt="entry.title || 'Entry Image'" loading="lazy" />
    <div class="meta" v-if="entry.title || entry.description">
      <h4>{{ entry.title }}</h4>
      <p>{{ entry.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.entry-card {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-maroon);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.entry-card:hover {
  border-color: var(--color-blood);
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  transform: scale(1.02);
}

img {
  width: 100%;
  display: block;
}

.meta {
  padding: 1rem;
}

h4 {
  margin: 0;
  color: var(--color-red);
  font-family: var(--font-display);
  font-size: 0.9rem;
}

p {
  font-size: 0.8rem;
  color: var(--color-text-dim);
  margin-top: 0.3rem;
}
</style>
