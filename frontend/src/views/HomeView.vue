<script setup>
import { ref, onMounted } from 'vue'
import api, { BACKEND_URL } from '../services/api'

const posts = ref([])

const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${BACKEND_URL}${url}`
}

onMounted(async () => {
    try {
        const res = await api.getPosts()
        posts.value = res.data.posts || res.data
    } catch (err) {
        console.error(err)
    }
})
</script>

<template>
  <div class="home">
    <h1>Latest Posts</h1>
    <div v-if="posts.length === 0" class="empty-state">No posts yet.</div>
    <div v-else class="post-list">
      <div v-for="post in posts" :key="post._id" class="post-card">
        <div class="card-tag" v-if="post.tags && post.tags.length">
          {{ post.tags[0].name }}
        </div>
        <div class="card-tag" v-else>
          GENERAL
        </div>
        <img v-if="post.coverImage" :src="getImageUrl(post.coverImage)" class="post-image" />
        <div class="post-content">
          <h2>{{ post.title }}</h2>
          <p>{{ post.summary }}</p>
          <RouterLink :to="`/blog/${post._id}`" class="read-more">Read more →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem 0;
  max-width: 800px; /* Instagram-like feed width */
  margin: 0 auto;
}

h1 {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--color-red);
  text-shadow: var(--glow-red);
  margin-bottom: 3rem;
  text-align: center;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.post-card {
  border: var(--border-thickness) solid var(--color-red);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-md); /* Added rounded corners */
  transition: all 0.2s ease;
  box-shadow: var(--hard-shadow-offset) var(--hard-shadow-offset) 0px 0px var(--color-blood);
  position: relative;
}

.card-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--color-red);
  color: #fff;
  font-family: var(--font-ui);
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  z-index: 10;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  box-shadow: 2px 2px 0px #000;
  border-radius: 4px; /* Added rounded corners */
}

.post-card:hover { 
  transform: translate(-4px, -4px);
  box-shadow: calc(var(--hard-shadow-offset) + 4px) calc(var(--hard-shadow-offset) + 4px) 0px 0px var(--color-blood);
}

.post-image {
  width: 100%;
  height: auto;
  display: block; /* Removes bottom whitespace gap */
  object-fit: cover; /* Instagram-style fill */
  /* Fallback for very tall images: */
  max-height: 85vh; 
  border-bottom: var(--border-thickness) solid var(--color-red);
}

.post-content {
  padding: 2.5rem;
  background-image: linear-gradient(to bottom, rgba(139, 0, 0, 0.05), transparent);
}

.post-content h2 {
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  line-height: 1.1;
  color: #fff;
  font-family: var(--font-display);
}

.post-content p {
  color: var(--color-text-dim);
  line-height: 1.7;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.read-more {
    color: var(--color-teal);
    text-decoration: none;
    font-family: var(--font-ui);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.read-more:hover {
    color: #fff;
    text-shadow: 0 0 8px var(--color-teal);
    padding-left: 5px;
}

.empty-state {
    text-align: center;
    color: var(--color-text-dim);
    font-family: monospace;
    padding: 5rem;
}
</style>
