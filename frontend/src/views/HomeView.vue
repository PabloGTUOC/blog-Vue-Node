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
    <div class="section-title-wrapper">
      <h1>LATEST POSTS</h1>
      <div class="title-line"></div>
    </div>
    <div v-if="posts.length === 0" class="empty-state">No posts yet.</div>
    <div v-else class="post-list">
      <div v-for="post in posts" :key="post._id" class="post-card">
        <div class="card-tag" v-if="post.tags && post.tags.length">
          {{ post.tags[0].name }}
        </div>
        <div class="card-tag" v-else>
          GENERAL
        </div>
        <div class="post-image-container" v-if="post.coverImage">
          <img :src="getImageUrl(post.coverImage)" class="post-image" />
        </div>
        <div class="post-content">
          <h2>{{ post.title }}</h2>
          <p>{{ post.summary }}</p>
          <RouterLink :to="`/blog/${post._id}`" class="read-more">READ MORE -></RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem 0;
  max-width: 1000px;
  margin: 0 auto;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  gap: 1rem;
}

h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: #001A33;
  text-shadow: 2px 2px 0px rgba(0, 240, 255, 0.5);
  margin: 0;
  font-weight: 900;
  letter-spacing: 2px;
}

.title-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #00F0FF, #FF007A);
  position: relative;
}
.title-line::after {
  content: ">>";
  position: absolute;
  right: -25px;
  top: -8px;
  color: #FF007A;
  font-family: var(--font-display);
  font-weight: bold;
}

.post-list {
  columns: 2;
  column-gap: 2rem;
}

.post-card {
  break-inside: avoid;
  margin-bottom: 2rem;
  background: #FFFFFF;
  padding: 10px;
  border: 1px solid #1A1A1A;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  transition: all 0.2s ease;
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.15);
  position: relative;
}

.card-tag {
  position: absolute;
  top: 15px;
  right: -10px;
  background: var(--color-primary);
  color: #000;
  border: 2px solid #000;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 900;
  padding: 2px 8px;
  z-index: 10;
  box-shadow: 2px 2px 0 #000;
  text-transform: uppercase;
}

.post-card:hover { 
  transform: translateY(-4px);
  box-shadow: 10px 10px 0px rgba(0, 0, 0, 0.2);
}

.post-image-container {
  overflow: hidden;
  width: 100%;
  border: 1px solid #1A1A1A;
  border-radius: 2px;
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease;
  filter: sepia(0.2) contrast(1.1);
}

.post-card:hover .post-image {
  transform: scale(1.05);
}

.post-content {
  padding: 1rem 0.5rem 0.5rem 0.5rem;
  background: none;
}

.post-content h2 {
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  line-height: 1.1;
  color: #1A1A1A;
  font-family: var(--font-ui);
  text-transform: uppercase;
  font-weight: 900;
}

.post-content p {
  color: #333;
  line-height: 1.4;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-family: var(--font-main);
}

.read-more {
    color: #000;
    background: var(--color-primary);
    text-decoration: none;
    font-family: var(--font-display);
    font-weight: 900;
    text-transform: uppercase;
    padding: 2px 6px;
    font-size: 0.8rem;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.read-more:hover {
    background: #1A1A1A;
    color: var(--color-primary);
    border: 1px solid #1A1A1A;
}

.empty-state {
    text-align: center;
    color: var(--color-secondary);
    font-family: var(--font-display);
    font-size: 1.5rem;
    padding: 5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
}

@media (max-width: 768px) {
  .post-list {
    columns: 1;
  }
}
</style>
