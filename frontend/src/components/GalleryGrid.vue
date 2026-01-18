<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  galleries: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="gallery-grid">
    <div v-for="gallery in galleries" :key="gallery._id" class="gallery-card">
      <div class="cover-image" :style="{ backgroundImage: `url(${gallery.coverImage || '/placeholder.jpg'})` }"></div>
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.gallery-card {
  background: #222;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.gallery-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 10px #0ff;
}

.cover-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  background-color: #333;
}

.info {
  padding: 1rem;
}

h3 {
  margin: 0 0 0.5rem 0;
  color: #fff;
}

.btn {
  display: inline-block;
  margin-top: 0.5rem;
  color: #0ff;
  text-decoration: none;
  border: 1px solid #0ff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.btn:hover {
  background: #0ff;
  color: #000;
}
</style>
