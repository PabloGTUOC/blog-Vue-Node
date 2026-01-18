<script setup>
defineProps({
  entry: {
    type: Object,
    required: true
  }
})

// Helper to resolve image URL
const getImageUrl = (url) => {
  if (url.startsWith('http')) return url
  return `http://localhost:5000${url}`
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
  margin-bottom: 1rem;
  background: #222;
  border-radius: 8px;
  overflow: hidden;
}

img {
  width: 100%;
  display: block;
}

.meta {
  padding: 0.5rem;
}

h4 {
  margin: 0;
  color: #fff;
}
</style>
