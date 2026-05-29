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
    <div class="img-container">
      <img :src="getImageUrl(entry.imageUrl)" :alt="entry.title || 'Entry Image'" loading="lazy" />
    </div>
    <div class="meta" v-if="entry.title || entry.description">
      <h4>{{ entry.title }}</h4>
      <p>{{ entry.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.entry-card {
  display: flex;
  flex-direction: column;
  break-inside: avoid;
  margin-bottom: 2rem;
  background: #FFFFFF;
  padding: 12px;
  border: 2px solid #111;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.1s, box-shadow 0.1s;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.entry-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #111, var(--glow-accent);
}

.entry-card:hover img {
  transform: scale(1.05);
}

.img-container {
  overflow: hidden;
  width: 100%;
  border: 2px solid #111;
  border-radius: var(--radius-sm);
}

img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
  filter: sepia(0.2) contrast(1.1);
}

.meta {
  padding: 1rem 0.5rem 0.5rem 0.5rem;
}

h4 {
  margin: 0;
  color: #1A1A1A;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 0.95rem;
  text-transform: uppercase;
}

p {
  font-size: 0.85rem;
  color: #333;
  margin-top: 0.4rem;
  font-family: var(--font-main);
  line-height: 1.4;
}
</style>
