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
      <div class="cover-image-container">
        <div class="cover-image" :style="{ backgroundImage: `url(${getCoverUrl(gallery.coverImage)})` }"></div>
      </div>
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
  justify-content: center;
}

.gallery-card {
  background: #FFFFFF;
  padding: 10px;
  border: 1px solid #1A1A1A;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.15);
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 10px 0px rgba(0, 0, 0, 0.2);
}

.cover-image-container {
  overflow: hidden;
  height: 220px;
  width: 100%;
  border: 1px solid #1A1A1A;
  border-radius: 2px;
}

.gallery-card:hover .cover-image {
  transform: scale(1.05);
}

.card-date {
  position: absolute;
  top: 15px;
  right: -10px;
  left: auto;
  background: var(--color-primary);
  color: #000;
  border: 2px solid #000;
  padding: 2px 8px;
  z-index: 10;
  box-shadow: 2px 2px 0 #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.card-date .m {
    font-family: var(--font-display);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 1px;
    color: #000;
    margin-bottom: 2px;
}

.card-date .y {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: bold;
    color: #000;
}

.cover-image {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-color: var(--color-secondary);
  transition: transform 0.3s ease;
  filter: sepia(0.2) contrast(1.1);
}

.info {
  padding: 1rem 0.5rem 0.5rem 0.5rem;
}

h3 {
  margin: 0 0 0.8rem 0;
  color: #1A1A1A;
  font-family: var(--font-ui);
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
}

p {
  color: #333;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1.8rem;
  height: 2.8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: var(--font-main);
}

.btn {
  display: inline-block;
  color: #000;
  background: var(--color-primary);
  text-decoration: none;
  border: 1px solid transparent;
  padding: 2px 6px;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  transition: all 0.2s ease;
  width: fit-content;
}

.btn:hover {
  transform: none;
  box-shadow: none;
  filter: none;
  background: #1A1A1A;
  color: var(--color-primary);
  border: 1px solid #1A1A1A;
}
</style>
