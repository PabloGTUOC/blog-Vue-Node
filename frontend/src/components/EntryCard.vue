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
  padding: 10px;
  border: 1px solid #1A1A1A;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.15);
}

.entry-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 10px 0px rgba(0, 0, 0, 0.2);
}

.entry-card:hover img {
  transform: scale(1.05);
}

.img-container {
  overflow: hidden;
  width: 100%;
  border: 1px solid #1A1A1A;
  border-radius: 2px;
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
  font-size: 0.9rem;
  text-transform: uppercase;
}

p {
  font-size: 0.8rem;
  color: #333;
  margin-top: 0.3rem;
  font-family: var(--font-main);
}
</style>
