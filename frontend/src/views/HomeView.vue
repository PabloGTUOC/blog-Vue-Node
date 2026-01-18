<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const posts = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/posts')
    posts.value = res.data
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <div class="home">
    <h1>Latest Posts</h1>
    <div v-if="posts.length === 0">No posts yet.</div>
    <div v-else class="post-list">
      <div v-for="post in posts" :key="post._id" class="post-card">
        <h2>{{ post.title }}</h2>
        <p>{{ post.summary }}</p>
        <RouterLink :to="`/blog/${post._id}`">Read more</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
}

h1 {
  color: #f0f; /* Neon magenta */
  text-shadow: 0 0 5px #f0f;
}

.post-card {
  border: 1px solid #333;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #1a1a1a;
}
</style>
