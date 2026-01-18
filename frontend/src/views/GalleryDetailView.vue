<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import EntryCard from '../components/EntryCard.vue'

const route = useRoute()
const gallery = ref(null)
const entries = ref([])

onMounted(async () => {
  const id = route.params.id
  try {
    const galleryRes = await api.get(`/galleries/${id}`)
    gallery.value = galleryRes.data
    
    // Fetch entries
    const entriesRes = await api.get(`/entries/gallery/${gallery.value._id}`)
    entries.value = entriesRes.data
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <div class="gallery-detail" v-if="gallery">
    <div class="header">
        <h1>{{ gallery.name }}</h1>
        <p>{{ gallery.description }}</p>
    </div>
    
    <div class="masonry-grid">
      <EntryCard v-for="entry in entries" :key="entry._id" :entry="entry" />
    </div>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.gallery-detail {
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

h1 {
  color: #0ff;
  text-shadow: 0 0 5px #0ff;
}

.masonry-grid {
  column-count: 3;
  column-gap: 1rem;
}

@media (max-width: 768px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 480px) {
  .masonry-grid {
    column-count: 1;
  }
}
</style>
