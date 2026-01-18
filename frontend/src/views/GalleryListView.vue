<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import GalleryGrid from '../components/GalleryGrid.vue'

const galleries = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/galleries')
    galleries.value = res.data
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <div class="gallery-list">
    <h1>Photo Galleries</h1>
    <GalleryGrid :galleries="galleries" />
  </div>
</template>

<style scoped>
.gallery-list {
  padding: 2rem;
}
h1 {
  color: #0ff;
  text-shadow: 0 0 5px #0ff;
  margin-bottom: 2rem;
}
</style>
